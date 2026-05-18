import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  CaretRight, CaretDown, CaretUp, Share, Plus, ArrowRight, ArrowUp,
  Flag, ShieldCheck, Target, ChartBar,
  Binoculars, MagnifyingGlass, Database, Cpu, Clock, Quotes,
  Lightning, TrendUp, Compass, Question, FileCsv, ChatTeardropDots,
} from '@phosphor-icons/react';
import { StagePage } from '../components/StagePage';
import { SpyMascot } from '../components/SpyMascot';
import { RUNS } from '../mock/runs';
import { PROJECTS } from '../mock/projects';
import type { AgentRun } from '../types/agent';

// /reports/:runId — the agent results surface.
//
// Renders a pixel-perfect "report" layout: breadcrumb + title + dark hero
// card with an agent-specific mascot + three tabs (Summary / Full Report /
// Methodology). Evidence is inline — every finding in Full Report has a
// [Show evidence] toggle that reveals the specialist, tools, raw data,
// and AI judgment that produced the claim.
//
// Content per agent lives in a `ReportConfig` (see REPORT_CONFIGS at the
// bottom of this file). Runs without a config fall back to the StagePage
// canvas that ships with the rest of the app.

export function AgentResults() {
  const { runId } = useParams();
  const run = runId ? RUNS[runId] : undefined;
  if (!run) return <Navigate to="/" replace />;

  const completedRun = { ...run, status: 'completed' as const };
  const config = REPORT_CONFIGS[completedRun.runId];

  if (config) {
    return <AgentReportView run={completedRun} config={config} />;
  }

  return (
    <div className="mx-auto max-w-[860px]">
      <StagePage run={completedRun} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Agent report · shared shell
// ════════════════════════════════════════════════════════════════════════

type ReportTab = 'summary' | 'full' | 'methodology';

export interface ReportConfig {
  generated: { date: string; time: string };
  mascot: () => React.ReactNode;
  summary: SummaryData;
  fullReport: Section[];
  methodology: {
    intro: string;
    runtime: { value: string; label: string }[];
    specialistsIntro: string;
    specialists: { icon: Section['icon']; name: string; role: string; tools: string[] }[];
    freshness: string;
  };
}

// Summary tab data — strategist-led structure.
//
// Order of consumption mirrors the page flow:
//   1. verdict     — the so-what, written like a signed memo
//   2. actions     — three decision cards (sorted by readiness then impact)
//   3. insights    — supporting findings ("what we found")
//   4. checks      — operational questions to resolve before exporting
//
// Lead with judgment + action, not with raw findings. Findings now play
// the supporting role they should have played all along.
export interface SummaryData {
  verdict: VerdictData;
  actions: ActionCardData[];
  insights: InsightCardData[];
  checks: CheckData[];
}

export interface VerdictData {
  /** One-sentence judgment. Should name the cause, not just the surface metric. */
  statement: string;
  /** Counts feed the inline classifier line. */
  actionsReady: number;
  actionsReview: number;
  /** Pre-action risk written as a single sentence — "main risk: …". */
  risk: string;
}

export type ActionReadiness = 'ready' | 'needs-review' | 'needs-brand-review';

export interface ActionCardData {
  /** Display category eyebrow (e.g. "NEGATIVES", "BIDDING", "AD COPY"). */
  category: string;
  title: string;
  readiness: ActionReadiness;
  /** Secondary chips after the readiness chip. Tone drives chip styling. */
  badges: ActionBadge[];
  whyMatters: string;
  expected: string;
  tradeoff: string;
  primaryCta: string;
  secondaryCta: string;
}

export interface ActionBadge {
  label: string;
  /**
   * `risk-low` → green tint. `impact-high` → red-orange. `check` → amber.
   * `count` → neutral. `meta` → muted lavender (e.g. "Copy drafts available").
   */
  tone: 'risk-low' | 'impact-high' | 'check' | 'count' | 'meta';
}

export interface InsightCardData {
  title: string;
  whatWeSaw: string;
  whyItMatters: string;
  signal: string;
  evidenceLabel: string;
}

export interface CheckData {
  title: string;
  body: string;
}

function AgentReportView({ run, config }: { run: AgentRun; config: ReportConfig }) {
  const project = PROJECTS.find((p) => p.id === run.projectId);
  const projectName = project?.name ?? '';
  const [tab, setTab] = useState<ReportTab>('summary');

  return (
    <div className="font-sans text-ppc-ink">
      <Breadcrumbs trail={['Reports', run.parentAgent.name, projectName]} />
      <TitleRow agentName={run.parentAgent.name} onJumpToAudit={() => setTab('full')} />
      <MetaLine date={config.generated.date} time={config.generated.time} />
      <HeroCard run={run} mascot={config.mascot()} />
      <Tabs active={tab} onChange={setTab} />
      {tab === 'summary' && (
        <SummaryView summary={config.summary} onSeeFullReport={() => setTab('full')} />
      )}
      {tab === 'full' && <FullReportView sections={config.fullReport} />}
      {tab === 'methodology' && <MethodologyView methodology={config.methodology} />}
    </div>
  );
}


// ─── Breadcrumb ──────────────────────────────────────────────────────────

export function Breadcrumbs({ trail }: { trail: string[] }) {
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

export function TitleRow({
  agentName,
  onJumpToAudit,
}: {
  agentName: string;
  onJumpToAudit: () => void;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="ppc-h1 text-ppc-ink">
          {agentName}
        </h1>
        <OnTrackPill />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SecondaryButton icon={<Share size={14} weight="bold" />}>
          Share
          <CaretDown size={11} weight="bold" className="ml-1 text-ppc-text-muted" />
        </SecondaryButton>
        <PrimaryButton icon={<Plus size={14} weight="bold" />} onClick={onJumpToAudit}>
          Audit the data
        </PrimaryButton>
      </div>
    </div>
  );
}

function OnTrackPill() {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-[14px] py-[7px] text-[13.5px] font-semibold"
      style={{
        background: '#DEF7E7',
        color: '#1F8A5A',
        boxShadow: 'inset 0 0 0 1px rgba(31,138,90,0.18)',
      }}
    >
      <span
        aria-hidden
        className="h-[7px] w-[7px] rounded-full"
        style={{
          background: '#1F8A5A',
          boxShadow: '0 0 0 3px rgba(31,138,90,0.18)',
        }}
      />
      Completed
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
  onClick,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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

export function MetaLine({ date, time }: { date: string; time: string }) {
  return (
    <p className="mb-7 text-[13.5px] text-ppc-text-muted">
      Generated {date}
      <span className="mx-2 text-ppc-text-faint">·</span>
      {time}
    </p>
  );
}

// ─── Dark hero card ──────────────────────────────────────────────────────

export function HeroCard({ run, mascot }: { run: AgentRun; mascot: React.ReactNode }) {
  const headline = run.headline;
  const hasPeriod = headline.endsWith('.');
  const body = hasPeriod ? headline.slice(0, -1) : headline;

  return (
    <section
      className="relative mb-5 overflow-hidden rounded-[20px] text-white"
      style={{
        background:
          'radial-gradient(120% 100% at 88% 10%, #1A0D38 0%, #0A0518 45%, #050308 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.05) inset, 0 30px 60px -30px rgba(15,10,30,0.55)',
      }}
    >
      {/* Top sheen line */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(201,181,255,0.50) 30%, rgba(201,181,255,0.50) 70%, transparent 100%)',
        }}
      />
      {/* Top-right purple bloom (concentrated behind mascot) */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 top-[12%] h-[420px] w-[420px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(159,134,255,0.42) 0%, rgba(127,90,240,0.14) 38%, transparent 68%)',
        }}
      />
      {/* Distant lower-right glow (under the grid horizon) */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-[18%] h-[260px] w-[420px] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(159,134,255,0.22) 0%, transparent 70%)',
        }}
      />
      {/* Subtle starfield grain — heavier in the upper portion */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60%] opacity-[0.10]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '4px 4px',
          mixBlendMode: 'screen',
          maskImage:
            'linear-gradient(180deg, black 0%, black 50%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(180deg, black 0%, black 50%, transparent 100%)',
        }}
      />

      {/* Perspective grid floor — confined to the mascot side so the
          centre of the card doesn't read as an empty stage. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-[12%] hidden h-[78%] w-[36%] overflow-hidden sm:block"
        style={{
          maskImage:
            'radial-gradient(ellipse 85% 90% at 75% 70%, black 0%, rgba(0,0,0,0.55) 45%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 90% at 75% 70%, black 0%, rgba(0,0,0,0.55) 45%, transparent 78%)',
        }}
      >
        <span
          className="absolute inset-x-[-30%] bottom-0 h-[200%]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(159,134,255,0.20) 1px, transparent 1px),
              linear-gradient(90deg, rgba(159,134,255,0.20) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            transform: 'perspective(560px) rotateX(58deg)',
            transformOrigin: 'center bottom',
          }}
        />
      </span>

      <div className="relative grid gap-4 px-9 pb-5 pt-8 sm:grid-cols-[1fr_240px] sm:gap-5 sm:px-10 sm:pt-9">
        {/* Copy column */}
        <div className="min-w-0">
          <h2 className="ppc-h1 text-white">
            {body}
            {hasPeriod && <span style={{ color: '#9F86FF' }}>.</span>}
          </h2>
          <p className="mt-4 max-w-[520px] text-[14px] leading-[1.55] text-white/65">
            {run.description}
          </p>
        </div>

        {/* Mascot column — vertically centered with copy, no empty stage.
            Agent-specific render via the `mascot` prop on the config. */}
        <div className="relative flex items-center justify-end">
          {mascot}
        </div>
      </div>

      {/* Stat tiles inside the dark card */}
      <div className="relative grid gap-3 px-9 pb-7 sm:grid-cols-3 sm:gap-4 sm:px-10">
        {run.stats?.map((s, i) => (
          <DarkStatTile key={i} value={s.value} label={s.label} icon={STAT_ICONS[i] ?? 'lightning'} />
        ))}
      </div>
    </section>
  );
}

// Icon assignment follows the data order: quick wins (lightning), upside
// (trend up), rival growth (arrow up). Stays unified in lavender — the
// "stage" feel comes from the perspective grid, not from tonal accents.
type StatIcon = 'lightning' | 'trendup' | 'arrowup';
const STAT_ICONS: StatIcon[] = ['lightning', 'trendup', 'arrowup'];

function StatIconBadge({ kind }: { kind: StatIcon }) {
  const Icon =
    kind === 'lightning' ? Lightning :
    kind === 'trendup'   ? TrendUp :
                           ArrowUp;
  return (
    <span
      className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full"
      style={{
        background: 'rgba(127,90,240,0.18)',
        boxShadow: 'inset 0 0 0 1px rgba(159,134,255,0.32)',
      }}
    >
      <Icon size={20} weight="bold" style={{ color: '#C9B5FF' }} />
    </span>
  );
}

function DarkStatTile({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: StatIcon;
}) {
  const m = value.match(/^(.+?)(\/\w+)$/);
  const main = m ? m[1] : value;
  const suffix = m ? m[2] : null;
  return (
    <div
      className="relative flex items-center gap-4 overflow-hidden rounded-[14px] px-5 py-[18px]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        boxShadow:
          'inset 0 0 0 1px rgba(159,134,255,0.18), 0 1px 0 rgba(255,255,255,0.03) inset',
      }}
    >
      <StatIconBadge kind={icon} />
      <div className="min-w-0 flex-1">
        <div className="ppc-h2 text-white tabular-nums">
          {main}
          {suffix && (
            <span className="ml-[1px] text-[14px] font-medium text-white/55">
              {suffix}
            </span>
          )}
        </div>
        <p className="mt-2 text-[12.5px] leading-[1.35] text-white/65">{label}</p>
      </div>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────

const TABS: { id: ReportTab; label: string }[] = [
  { id: 'summary',     label: 'Summary' },
  { id: 'full',        label: 'Full Report' },
  { id: 'methodology', label: 'Methodology' },
];

export type { ReportTab };
export function Tabs({
  active,
  onChange,
}: {
  active: ReportTab;
  onChange: (t: ReportTab) => void;
}) {
  return (
    <div
      className="mb-7 flex flex-wrap items-center gap-2"
      style={{ borderBottom: '1px solid #e6e1ef' }}
    >
      {TABS.map(({ id, label }) => {
        const on = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`relative px-5 py-[14px] text-[16px] font-semibold tracking-[-0.005em] transition-colors ${
              on ? 'text-ppc-ink' : 'text-ppc-text-muted hover:text-ppc-ink'
            }`}
          >
            {label}
            {on && (
              <span
                aria-hidden
                className="absolute -bottom-[1px] left-5 right-5 h-[2.5px] rounded-full"
                style={{ background: '#7F5AF0' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Summary view · strategist-led
// ════════════════════════════════════════════════════════════════════════
//
// Order:
//   1. Strategist verdict     — dark callout, the so-what
//   2. Top recommended actions — three decision cards, color-coded by readiness
//   3. What we found          — supporting insight cards
//   4. Checks before export   — questions to resolve before acting
//   5. Full-report CTA        — footer
//
// Replaces the legacy "What we found → Top recommendations" pair that led
// with raw findings. The page now leads with judgment and action.

function SummaryView({
  summary,
  onSeeFullReport,
}: {
  summary: SummaryData;
  onSeeFullReport: () => void;
}) {
  return (
    <div className="mb-10 space-y-8">
      <StrategistVerdict
        verdict={summary.verdict}
        actionCount={summary.actions.length}
        onSeeFullReport={onSeeFullReport}
      />
      <TopActionsSection actions={summary.actions} />
      <WhatWeFoundSection insights={summary.insights} />
      <ChecksSection checks={summary.checks} />
      <FullReportFooter onSeeFullReport={onSeeFullReport} />
    </div>
  );
}

// ─── 1. Strategist verdict ───────────────────────────────────────────────
//
// Compact dark callout. Reads like a signed memo: eyebrow, single-sentence
// verdict, action classifier, pre-action risk. No mascot, no perspective
// grid — visually quieter than the hero so the two dark panels coexist.

function StrategistVerdict({
  verdict,
  actionCount,
  onSeeFullReport,
}: {
  verdict: VerdictData;
  actionCount: number;
  onSeeFullReport: () => void;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-[18px] text-white"
      style={{
        background:
          'radial-gradient(110% 100% at 18% 0%, #1B0F39 0%, #0A0518 55%, #050308 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 50px -28px rgba(15,10,30,0.55)',
      }}
    >
      {/* Top sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-12 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(201,181,255,0.45) 35%, rgba(201,181,255,0.45) 65%, transparent 100%)',
        }}
      />
      {/* Soft upper-left bloom — mirror of the hero's upper-right.
          Keeps the two dark panels distinct without competing. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-32 h-[360px] w-[360px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(127,90,240,0.32) 0%, rgba(127,90,240,0.10) 42%, transparent 70%)',
        }}
      />
      {/* Subtle grain */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'screen',
        }}
      />

      <div className="relative grid gap-7 px-9 py-8 sm:grid-cols-[1.4fr_1fr] sm:px-11 sm:py-9">
        {/* Left: eyebrow + verdict statement */}
        <div className="min-w-0">
          <VerdictEyebrow />
          <h3 className="ppc-h2 mt-5 text-white">
            {verdict.statement}
          </h3>

          <p className="mt-5 max-w-[520px] text-[14.5px] leading-[1.6] text-white/72">
            We surfaced{' '}
            <VerdictNumber>{actionCount}</VerdictNumber> useful actions
            {verdict.actionsReady > 0 && (
              <>
                {' '}—{' '}
                <VerdictNumber>{verdict.actionsReady}</VerdictNumber>{' '}
                ready to export
              </>
            )}
            {verdict.actionsReview > 0 && (
              <>
                ,{' '}
                <VerdictNumber>{verdict.actionsReview}</VerdictNumber>{' '}
                need review before acting
              </>
            )}
            .
          </p>
        </div>

        {/* Right: risk panel + CTAs */}
        <div className="flex min-w-0 flex-col justify-between gap-6 sm:items-end">
          <div
            className="w-full rounded-[12px] px-5 py-4 sm:max-w-[340px]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            <div className="mb-2 flex items-center gap-[7px]">
              <span
                aria-hidden
                className="h-[6px] w-[6px] rounded-full"
                style={{
                  background: '#E2A536',
                  boxShadow: '0 0 0 3px rgba(226,165,54,0.18)',
                }}
              />
              <span className="text-[11px] font-semibold text-white/60">
                Main risk
              </span>
            </div>
            <p className="text-[13px] leading-[1.55] text-white/85">
              {verdict.risk}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('top-actions');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="inline-flex items-center gap-2 rounded-[10px] px-[16px] py-[10px] text-[13px] font-semibold text-white transition-transform hover:-translate-y-[0.5px]"
              style={{
                background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
                boxShadow:
                  '0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 14px -6px rgba(127,90,240,0.55)',
              }}
            >
              Review actions
              <ArrowRight size={12} weight="bold" />
            </button>
            <button
              type="button"
              onClick={onSeeFullReport}
              className="inline-flex items-center gap-1.5 rounded-[10px] px-[14px] py-[10px] text-[13px] font-semibold text-white/85 transition-colors hover:bg-white/[0.06] hover:text-white"
              style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)' }}
            >
              View full evidence
              <ArrowRight size={11} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function VerdictEyebrow() {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-[11px] py-[5px] text-[11px] font-semibold"
      style={{
        background: 'rgba(127,90,240,0.16)',
        color: '#C9B5FF',
        boxShadow: 'inset 0 0 0 1px rgba(159,134,255,0.30)',
      }}
    >
      <Compass size={11} weight="fill" />
      Strategist verdict
    </span>
  );
}

function VerdictNumber({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-display font-extrabold text-white"
      style={{
        fontFeatureSettings: '"tnum" 1',
        letterSpacing: '-0.015em',
      }}
    >
      {children}
    </span>
  );
}

// ─── 2. Top recommended actions ──────────────────────────────────────────
//
// Three decision cards. Each card carries:
//   - numbered + category eyebrow
//   - large title
//   - readiness chip + secondary badges
//   - Why this matters / Expected outcome / Tradeoff or risk
//   - footer with primary + secondary CTA + "Ask follow-up"
//
// Left rail is color-coded by readiness — emerald (ready), amber (review),
// purple (brand review). Communicates safety at a glance.

function TopActionsSection({ actions }: { actions: ActionCardData[] }) {
  return (
    <section id="top-actions" className="scroll-mt-6">
      <SectionTitle
        title="Top recommended actions"
        sub="Prioritised by impact, confidence, and ease of review."
      />
      <div className="flex flex-col gap-5">
        {actions.map((a, i) => (
          <ActionCard key={i} index={i + 1} action={a} />
        ))}
      </div>
    </section>
  );
}

function ActionCard({ index, action }: { index: number; action: ActionCardData }) {
  const rail = READINESS_THEME[action.readiness];
  return (
    <article
      className="relative overflow-hidden rounded-[18px] bg-white"
      style={{
        boxShadow:
          '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02), 0 24px 40px -28px rgba(15,10,30,0.14)',
      }}
    >
      {/* Readiness rail (full-height) */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[4px]"
        style={{ background: rail.rail }}
      />

      <div className="relative pb-7 pl-9 pr-7 pt-7 sm:pl-11 sm:pr-9 sm:pt-8">
        {/* Numbered category eyebrow */}
        <div
          className="mb-3 flex items-center gap-[10px] text-[11px] font-semibold leading-none"
          style={{ color: rail.eyebrow }}
        >
          <span
            className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-[5px] px-[5px] tabular-nums"
            style={{
              background: rail.numberBg,
              color: rail.numberFg,
              boxShadow: `inset 0 0 0 1px ${rail.numberRing}`,
            }}
          >
            {String(index).padStart(2, '0')}
          </span>
          <span className="text-ppc-text-muted">{action.category}</span>
        </div>

        {/* Title */}
        <h4 className="ppc-h3 text-ppc-ink">
          {action.title}
        </h4>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ReadinessChip readiness={action.readiness} />
          {action.badges.map((b, i) => (
            <ActionBadgePill key={i} badge={b} />
          ))}
        </div>

        {/* Body — three labeled sections */}
        <div className="mt-6 space-y-5">
          <ActionDetail label="Why this matters" body={action.whyMatters} />
          <ActionDetail label="Expected outcome" body={action.expected} />
          <ActionDetail label="Tradeoff / risk"  body={action.tradeoff} />
        </div>

        {/* Footer — actions */}
        <footer
          className="mt-7 flex flex-wrap items-center justify-between gap-3 pt-5"
          style={{ borderTop: '1px solid #f0eaf6' }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <PrimaryPillButton>{action.primaryCta}</PrimaryPillButton>
            <GhostPillButton icon={<FileCsv size={13} weight="bold" />}>
              {action.secondaryCta}
            </GhostPillButton>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ppc-text-muted transition-colors hover:text-ppc-purple-600"
          >
            <ChatTeardropDots size={13} weight="bold" />
            Ask follow-up
          </button>
        </footer>
      </div>
    </article>
  );
}

function ActionDetail({ label, body }: { label: string; body: string }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:gap-5">
      <span
        className="pt-[3px] text-[11px] font-semibold leading-none text-ppc-text-muted"
      >
        {label}
      </span>
      <p className="max-w-[560px] text-[13.5px] leading-[1.6] text-ppc-ink/85">
        {body}
      </p>
    </div>
  );
}

// Readiness theme — keys to ActionReadiness.
const READINESS_THEME: Record<
  ActionReadiness,
  {
    rail: string;
    eyebrow: string;
    numberBg: string;
    numberFg: string;
    numberRing: string;
    chipBg: string;
    chipFg: string;
    chipRing: string;
    chipDot: string;
    chipLabel: string;
  }
> = {
  ready: {
    rail: 'linear-gradient(180deg, #5DCAA5 0%, #2F9A7A 100%)',
    eyebrow: '#1F8A5A',
    numberBg: '#E0F4EA',
    numberFg: '#1F8A5A',
    numberRing: 'rgba(31,138,90,0.20)',
    chipBg: '#DEF7E7',
    chipFg: '#1F8A5A',
    chipRing: 'rgba(31,138,90,0.22)',
    chipDot: '#1F8A5A',
    chipLabel: 'Ready to export',
  },
  'needs-review': {
    rail: 'linear-gradient(180deg, #E2A536 0%, #B07820 100%)',
    eyebrow: '#915214',
    numberBg: '#FCEDD0',
    numberFg: '#915214',
    numberRing: 'rgba(145,82,20,0.20)',
    chipBg: '#FFE8C7',
    chipFg: '#915214',
    chipRing: 'rgba(145,82,20,0.22)',
    chipDot: '#B07820',
    chipLabel: 'Needs review',
  },
  'needs-brand-review': {
    rail: 'linear-gradient(180deg, #A88CFF 0%, #7F5AF0 100%)',
    eyebrow: '#534AB7',
    numberBg: '#EDE7FB',
    numberFg: '#534AB7',
    numberRing: 'rgba(83,74,183,0.20)',
    chipBg: '#EDE7FB',
    chipFg: '#534AB7',
    chipRing: 'rgba(83,74,183,0.22)',
    chipDot: '#7F5AF0',
    chipLabel: 'Needs brand review',
  },
};

function ReadinessChip({ readiness }: { readiness: ActionReadiness }) {
  const t = READINESS_THEME[readiness];
  return (
    <span
      className="inline-flex items-center gap-[7px] rounded-full px-[11px] py-[5px] text-[11.5px] font-semibold"
      style={{
        background: t.chipBg,
        color: t.chipFg,
        boxShadow: `inset 0 0 0 1px ${t.chipRing}`,
      }}
    >
      <span
        aria-hidden
        className="h-[6px] w-[6px] rounded-full"
        style={{ background: t.chipDot }}
      />
      {t.chipLabel}
    </span>
  );
}

function ActionBadgePill({ badge }: { badge: ActionBadge }) {
  const style = BADGE_TONES[badge.tone];
  return (
    <span
      className="inline-flex items-center rounded-full px-[10px] py-[4px] text-[11px] font-semibold"
      style={{
        background: style.bg,
        color: style.fg,
        boxShadow: `inset 0 0 0 1px ${style.ring}`,
      }}
    >
      {badge.label}
    </span>
  );
}

const BADGE_TONES: Record<
  ActionBadge['tone'],
  { bg: string; fg: string; ring: string; mono?: boolean }
> = {
  'risk-low':    { bg: '#E6F7EE', fg: '#1F8A5A', ring: 'rgba(31,138,90,0.18)' },
  'impact-high': { bg: '#FFE6E0', fg: '#B7321E', ring: 'rgba(183,50,30,0.20)' },
  'check':       { bg: '#FFF1DA', fg: '#915214', ring: 'rgba(145,82,20,0.22)' },
  'count':       { bg: '#F2EEF9', fg: '#3C3489', ring: 'rgba(60,52,137,0.18)', mono: true },
  'meta':        { bg: '#EFEAFA', fg: '#534AB7', ring: 'rgba(83,74,183,0.18)' },
};

// ─── 3. What we found (supporting insights) ──────────────────────────────

function WhatWeFoundSection({ insights }: { insights: InsightCardData[] }) {
  return (
    <section>
      <SectionTitle
        title="What we found"
        sub="The evidence behind the recommended actions."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {insights.map((ins, i) => (
          <InsightCard key={i} insight={ins} />
        ))}
      </div>
    </section>
  );
}

function InsightCard({ insight }: { insight: InsightCardData }) {
  return (
    <article
      className="flex flex-col rounded-[14px] bg-white px-5 py-5"
      style={{
        boxShadow:
          '0 0 0 1px #e8e2f0, 0 1px 0 rgba(15,10,30,0.02), 0 14px 28px -22px rgba(15,10,30,0.10)',
      }}
    >
      <h4 className="ppc-h4 text-ppc-ink">
        {insight.title}
      </h4>

      <div className="mt-4 space-y-4">
        <InsightBlock label="What we saw"   body={insight.whatWeSaw} />
        <InsightBlock label="Why it matters" body={insight.whyItMatters} />
      </div>

      <div className="my-4 flex items-center gap-2">
        <span
          aria-hidden
          className="h-[5px] w-[5px] rounded-full"
          style={{ background: '#7F5AF0' }}
        />
        <span className="text-[11px] font-semibold text-ppc-text-muted">
          Signal
        </span>
      </div>
      <p className="text-[12.5px] leading-[1.5] text-ppc-ink/85">
        {insight.signal}
      </p>

      <button
        type="button"
        className="mt-5 inline-flex items-center gap-1.5 self-start text-[12.5px] font-semibold text-ppc-purple-500 transition-colors hover:text-ppc-purple-600"
      >
        <MagnifyingGlass size={11} weight="bold" />
        {insight.evidenceLabel}
        <ArrowRight size={11} weight="bold" />
      </button>
    </article>
  );
}

function InsightBlock({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold leading-none text-ppc-text-muted">
        {label}
      </p>
      <p className="text-[12.5px] leading-[1.5] text-ppc-ink/85">{body}</p>
    </div>
  );
}

// ─── 4. Checks before export ─────────────────────────────────────────────
//
// Calm panel — communicates careful review, not failure. Soft amber tint
// signals "decision pending" without alarm.

function ChecksSection({ checks }: { checks: CheckData[] }) {
  return (
    <section
      className="rounded-[16px] px-7 py-7"
      style={{
        background: 'linear-gradient(180deg, #FFF9EE 0%, #FBF6E5 100%)',
        boxShadow: 'inset 0 0 0 1px #f3e6c5',
      }}
    >
      <div className="mb-5 flex items-start gap-4">
        <span
          className="grid h-[40px] w-[40px] shrink-0 place-items-center rounded-[10px]"
          style={{
            background: 'linear-gradient(155deg, #F4CC7A 0%, #C38A1E 100%)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.45) inset, 0 6px 14px -6px rgba(195,138,30,0.45)',
          }}
        >
          <Question size={18} weight="bold" className="text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="ppc-h3 text-ppc-ink">
            Checks before export
          </h3>
          <p className="mt-1 max-w-[640px] text-[13px] leading-[1.55] text-ppc-text-muted">
            These don't block the report — they help avoid risky changes
            before anything is exported or applied.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {checks.map((c, i) => (
          <CheckRow key={i} check={c} />
        ))}
      </div>
    </section>
  );
}

function CheckRow({ check }: { check: CheckData }) {
  return (
    <div
      className="flex flex-wrap items-start justify-between gap-4 rounded-[12px] bg-white px-5 py-4"
      style={{ boxShadow: 'inset 0 0 0 1px #f0e6cc' }}
    >
      <div className="min-w-0 flex-1">
        <h4 className="ppc-h4 text-ppc-ink">
          {check.title}
        </h4>
        <p className="mt-1.5 max-w-[640px] text-[13px] leading-[1.55] text-ppc-text-muted">
          {check.body}
        </p>
      </div>
      <button
        type="button"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] px-[14px] py-[8px] text-[12.5px] font-semibold text-ppc-ink transition-colors hover:bg-ppc-panel-soft"
        style={{ boxShadow: 'inset 0 0 0 1px #ddd3c2', background: '#FFFDF7' }}
      >
        Resolve
        <ArrowRight size={11} weight="bold" />
      </button>
    </div>
  );
}

// ─── 5. Full report footer CTA ───────────────────────────────────────────

function FullReportFooter({ onSeeFullReport }: { onSeeFullReport: () => void }) {
  return (
    <div className="flex justify-center pt-2">
      <button
        type="button"
        onClick={onSeeFullReport}
        className="inline-flex items-center gap-2 rounded-[10px] bg-white px-[18px] py-[12px] text-[13px] font-semibold text-ppc-ink transition-colors hover:bg-ppc-panel-soft"
        style={{
          boxShadow:
            '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02), 0 14px 28px -22px rgba(15,10,30,0.10)',
        }}
      >
        <MagnifyingGlass size={13} weight="bold" className="text-ppc-purple-500" />
        View full report with evidence
        <ArrowRight size={12} weight="bold" />
      </button>
    </div>
  );
}

// ─── Shared section header (used by Top actions + What we found) ─────────

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5">
      <h3 className="ppc-h3 text-ppc-ink">
        {title}
      </h3>
      <p className="mt-1 text-[13px] leading-[1.55] text-ppc-text-muted">
        {sub}
      </p>
    </div>
  );
}

// ─── Pill buttons (used by ActionCard footer) ────────────────────────────

function PrimaryPillButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-[10px] px-[14px] py-[9px] text-[12.5px] font-semibold text-white transition-transform hover:-translate-y-[0.5px]"
      style={{
        background: 'linear-gradient(180deg, #8767F3 0%, #6A45E2 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 14px -6px rgba(127,90,240,0.55)',
      }}
    >
      {children}
      <ArrowRight size={11} weight="bold" />
    </button>
  );
}

function GhostPillButton({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-[10px] border border-ppc-card-border bg-white px-[12px] py-[8px] text-[12.5px] font-medium text-ppc-ink transition-colors hover:bg-ppc-panel-soft"
    >
      {icon}
      {children}
    </button>
  );
}

// ─── Legacy ImpactChip export ────────────────────────────────────────────
// Used by /v4 SummaryV4. Kept here so /v4 keeps compiling — the v1 summary
// no longer renders these directly.

export function ImpactChip({ impact }: { impact: 'high' | 'medium' | 'low' }) {
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

// ════════════════════════════════════════════════════════════════════════
// Full Report view
// ════════════════════════════════════════════════════════════════════════
//
// Long-form view organized by specialist. Every finding ends with a
// [Show evidence ↓] toggle that opens an inline panel showing the
// specialist that produced it, the tools it called, a sample of the raw
// data, and the AI's judgment quote. Auditing happens next to the claim
// being audited — not in a separate destination.

interface Evidence {
  specialist: string;
  tools: string[];
  table: { columns: string[]; rows: string[][]; moreCount?: number };
  totalSamples: string;
  judgment: string;
}

interface SectionFinding {
  title: string;
  body: string;
  metric?: { value: string; label: string };
  impact?: 'high' | 'medium' | 'low';
  evidence: Evidence;
}

interface Section {
  icon: 'target' | 'binoculars' | 'chart' | 'flag';
  name: string;
  meta: string;
  findings: SectionFinding[];
}

const COMPETITOR_SPY_FULL_REPORT: Section[] = [
  {
    icon: 'target',
    name: 'Competitor Discovery',
    meta: '47 tool calls · 8 rivals identified · 7-day window',
    findings: [
      {
        title: '8 active rivals identified — 5 more than you were tracking',
        body:
          'We searched Google for your top 12 keywords across personal injury terms and recorded every advertiser appearing in the top 4 positions over a 7-day window. Cross-referenced each domain against public ad libraries to confirm active campaigns and rule out one-off appearances.',
        metric: { value: '8', label: 'Active rivals' },
        evidence: {
          specialist: 'Competitor Discovery',
          tools: ['serp_api.search', 'web.scrape', 'domain.lookup'],
          table: {
            columns: ['Rival', 'Domain', 'Est. spend', 'Active since'],
            rows: [
              ['Smith & Associates',    'smithlaw.com',     '$12K/mo', '2019'],
              ['Cleveland Injury Group', 'clevelandig.com',  '$9K/mo',  '2017'],
              ['Ohio Personal Injury',   'ohiopi.com',       '$7K/mo',  '2021'],
              ['Hartman Legal',          'hartmanlaw.com',   '$5K/mo',  '2020'],
            ],
            moreCount: 4,
          },
          totalSamples: '8 rivals · 12 keywords · 84 SERPs',
          judgment:
            'Five of these eight are not in the client\'s current competitive-set list. Two appear in every SERP we sampled, indicating saturated bidding rather than experimental campaigns.',
        },
      },
      {
        title: 'Top 4 rivals control 67% of available impression share',
        body:
          'Auction insights show four advertisers absorbing the majority of impressions across your target keywords. Three of them outrank you in head-to-head share above 50%.',
        metric: { value: '67%', label: 'Share concentrated in top 4' },
        evidence: {
          specialist: 'Competitor Discovery',
          tools: ['google_ads.auction_insights'],
          table: {
            columns: ['Rival', 'IS%', 'Position above rate', 'Overlap rate'],
            rows: [
              ['Smith & Associates',    '24.1%', '61%', '52%'],
              ['Cleveland Injury Group', '18.7%', '54%', '47%'],
              ['Ohio Personal Injury',   '13.4%', '49%', '38%'],
              ['Hartman Legal',          '11.0%', '44%', '34%'],
            ],
            moreCount: 4,
          },
          totalSamples: '8 rivals × 15 keywords = 120 data points',
          judgment:
            'Concentration is the story here — when share is this top-heavy, lifting bids on the contested keywords moves the needle faster than expanding to long-tail terms.',
        },
      },
    ],
  },
  {
    icon: 'binoculars',
    name: 'Auction Intelligence',
    meta: '18 tool calls · 120 data points · 8 rivals × 15 keywords',
    findings: [
      {
        title: 'Outranked on 8 of 12 high-spend keywords',
        body:
          'Rivals are consistently winning the top ad rank on your core terms. Bid analysis shows the gap is driven by both higher bids and stronger ad rank — not just spend.',
        metric: { value: '$3.1K/mo', label: 'Potential monthly upside' },
        impact: 'high',
        evidence: {
          specialist: 'Auction Intelligence',
          tools: ['google_ads.auction_insights', 'google_ads.report'],
          table: {
            columns: ['Keyword', 'Your avg pos', 'Best rival', 'Gap'],
            rows: [
              ['injury lawyer',              '#3.2', '#1.4 (Smith)',     '−1.8'],
              ['accident attorney',          '#4.1', '#2.1 (Smith)',     '−2.0'],
              ['personal injury law firm',   '#2.8', '#1.6 (Cleveland)', '−1.2'],
              ['car accident lawyer',        '#3.6', '#1.9 (Smith)',     '−1.7'],
            ],
            moreCount: 4,
          },
          totalSamples: '12 keywords · 30-day window',
          judgment:
            'Consistent pattern across 8 of 12 keywords, not noise. The gap is widest on commercial-intent terms where rivals have allocated their top bids — exactly where you\'re trying to win.',
        },
      },
      {
        title: '41% spend overlap is inflating your CPCs',
        body:
          'Rivals overlap with you on 41% of spend, meaning you\'re fighting the same auctions on the same terms. This compresses available impression share and pushes CPCs up across the contested set.',
        metric: { value: '41%', label: 'Overlap rate' },
        impact: 'medium',
        evidence: {
          specialist: 'Auction Intelligence',
          tools: ['google_ads.auction_insights'],
          table: {
            columns: ['Keyword', 'Overlap', 'Your CPC', 'CPC vs. uncontested'],
            rows: [
              ['injury lawyer',              '63%', '$48.20', '+34%'],
              ['accident attorney',          '57%', '$42.10', '+28%'],
              ['personal injury law firm',   '49%', '$36.40', '+22%'],
              ['car accident lawyer',        '44%', '$31.80', '+19%'],
            ],
            moreCount: 11,
          },
          totalSamples: '15 contested keywords',
          judgment:
            'Overlap above 40% is the threshold where match-type tightening usually pays for itself. Loose phrase match on three of these keywords is the proximate cause.',
        },
      },
    ],
  },
  {
    icon: 'chart',
    name: 'Ad Copy Pattern Analysis',
    meta: '96 tool calls · 47 ads sampled · 8 rivals',
    findings: [
      {
        title: 'Outcome-driven headlines win 64% more impression share',
        body:
          'Top rivals open with the outcome the buyer wants — "Get the settlement you deserve", "$2M+ won for clients" — not with the service category. Yours lead with category ("Personal injury attorney").',
        metric: { value: '+64%', label: 'Impression share lift' },
        impact: 'high',
        evidence: {
          specialist: 'Copy Pattern Analysis',
          tools: ['web.scrape', 'content.classifier', 'google_ads.search_term_report'],
          table: {
            columns: ['Rival', 'Headline 1', 'Framing', 'Est. CTR'],
            rows: [
              ['Smith & Associates',    '$2M+ won for clients',           'Outcome', '11.2%'],
              ['Cleveland Injury Group', 'Get the settlement you deserve', 'Outcome', '9.8%'],
              ['Your account',          'Personal injury attorney',       'Category', '4.1%'],
              ['Ohio Personal Injury',   'Free case review · 24/7',        'Offer',   '7.6%'],
            ],
            moreCount: 8,
          },
          totalSamples: '47 unique RSAs · 12 keywords',
          judgment:
            'The pattern is identifiable across 12 examples — and your two highest-performing existing ads already use outcome framing. This is a copy fix, not a strategy fix.',
        },
      },
    ],
  },
  {
    icon: 'flag',
    name: 'Strategic Recommendations',
    meta: '3 prioritized actions · ranked by impact × confidence',
    findings: [
      {
        title: 'Raise bids on 8 high-intent keywords (quick win · high impact)',
        body:
          'Focus the bid lift on the 8 keywords where you\'re outranked by 1.5+ positions and overlap exceeds 40%. Suggested target: position #2.0 or better.',
        metric: { value: '$3.1K/mo', label: 'Projected upside' },
        impact: 'high',
        evidence: {
          specialist: 'Strategy Synthesis',
          tools: ['google_ads.bid_simulator', 'google_ads.auction_insights'],
          table: {
            columns: ['Keyword', 'Current bid', 'Suggested', 'Forecast pos'],
            rows: [
              ['injury lawyer',              '$22', '$31', '#1.9'],
              ['accident attorney',          '$18', '$26', '#2.0'],
              ['personal injury law firm',   '$15', '$21', '#1.7'],
              ['car accident lawyer',        '$13', '$18', '#2.1'],
            ],
            moreCount: 4,
          },
          totalSamples: '8 keywords · 30-day forecast',
          judgment:
            'Bid simulator confidence: 84%. The forecast holds even under a 15% rival counter-raise, because impression-share headroom is the binding constraint, not CPC.',
        },
      },
      {
        title: 'Refresh headlines to match outcome-led pattern (high impact)',
        body:
          'Rewrite RSA headline 1 across your top 6 ad groups to lead with outcome framing. We have 12 concrete templates pulled from winning rival ads, already de-duped and brand-safe.',
        impact: 'high',
        evidence: {
          specialist: 'Strategy Synthesis',
          tools: ['content.classifier', 'content.template_extractor'],
          table: {
            columns: ['Template', 'Source pattern', 'Brand-safe'],
            rows: [
              ['{$amount}+ won for clients',          'Concrete outcome',   'Yes'],
              ['Get the settlement you deserve',      'Aspirational',       'Yes'],
              ['Free case review · 24/7',             'Risk reversal',      'Yes'],
              ['No fee unless we win your case',      'Contingency framing', 'Yes'],
            ],
            moreCount: 8,
          },
          totalSamples: '12 ready-to-test templates',
          judgment:
            'Two of your existing top-performing ads already use the "no fee unless we win" framing. Scaling that pattern across the other ad groups is the cheapest, lowest-risk lift available.',
        },
      },
      {
        title: 'Add 24 negative keywords to stop wasted spend (quick win)',
        body:
          'Search-term report flagged 24 queries that converted at <0.5% over the last 60 days. Adding these as exact-match negatives at the campaign level will redirect ~$420/mo to your converting terms.',
        metric: { value: '$420/mo', label: 'Saved spend' },
        evidence: {
          specialist: 'Strategy Synthesis',
          tools: ['google_ads.search_term_report'],
          table: {
            columns: ['Query', 'Impressions', 'Cost', 'Conv. rate'],
            rows: [
              ['free injury lawyer',         '1,402', '$184', '0.0%'],
              ['injury lawyer salary',       '892',   '$98',  '0.0%'],
              ['injury lawyer requirements', '631',   '$72',  '0.0%'],
              ['injury lawyer schools',      '418',   '$48',  '0.0%'],
            ],
            moreCount: 20,
          },
          totalSamples: '24 negative-keyword candidates',
          judgment:
            'All 24 are unambiguously off-intent: informational, employment-related, or location-mismatched. Confidence: 96%. No reason to A/B test these — apply directly.',
        },
      },
    ],
  },
];

export function FullReportView({ sections }: { sections: Section[] }) {
  return (
    <div className="mb-7 space-y-6">
      {sections.map((section, i) => (
        <FullReportSection key={i} section={section} />
      ))}
    </div>
  );
}

function FullReportSection({ section }: { section: Section }) {
  return (
    <section
      className="rounded-[16px] bg-white px-7 py-7"
      style={{
        boxShadow:
          '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02), 0 18px 32px -24px rgba(15,10,30,0.12)',
      }}
    >
      <div className="mb-6 flex items-start gap-4">
        <SectionIcon kind={section.icon} />
        <div className="min-w-0 flex-1">
          <h3 className="ppc-h3 text-ppc-ink">
            {section.name}
          </h3>
          <p className="mt-[3px] text-[12.5px] text-ppc-text-muted">
            {section.meta}
          </p>
        </div>
      </div>

      <div className="space-y-7">
        {section.findings.map((f, i) => (
          <FindingRow key={i} finding={f} isLast={i === section.findings.length - 1} />
        ))}
      </div>
    </section>
  );
}

function FindingRow({ finding, isLast }: { finding: SectionFinding; isLast: boolean }) {
  return (
    <div className={isLast ? '' : 'border-b border-[#f1ecf6] pb-7'}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h4 className="ppc-h4 max-w-[640px] text-ppc-ink">
          {finding.title}
        </h4>
        {finding.impact && <ImpactChip impact={finding.impact} />}
      </div>
      <p className="mt-3 max-w-[760px] text-[14px] leading-[1.6] text-ppc-text-muted">
        {finding.body}
      </p>
      {finding.metric && (
        <div className="mt-4 flex items-baseline gap-3">
          <span className="ppc-h2 text-ppc-ink tabular-nums">
            {finding.metric.value}
          </span>
          <span className="text-[12.5px] text-ppc-text-muted">
            {finding.metric.label}
          </span>
        </div>
      )}
      <EvidenceExpand evidence={finding.evidence} />
    </div>
  );
}

function SectionIcon({ kind }: { kind: Section['icon'] }) {
  const Icon =
    kind === 'target'     ? Target :
    kind === 'binoculars' ? Binoculars :
    kind === 'chart'      ? ChartBar :
                            Flag;
  return (
    <span
      className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-[11px]"
      style={{
        background: 'linear-gradient(155deg, #C9B5FF 0%, #8B6CF5 60%, #5A3FE0 100%)',
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.35) inset, 0 6px 14px -6px rgba(127,90,240,0.45)',
      }}
    >
      <Icon size={20} weight="bold" className="text-white" />
    </span>
  );
}

// ─── Evidence expansion ──────────────────────────────────────────────────

function EvidenceExpand({ evidence }: { evidence: Evidence }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-[8px] bg-white px-[12px] py-[7px] text-[12.5px] font-semibold text-ppc-purple-500 transition-colors hover:bg-[#F5F2FC] hover:text-ppc-purple-600"
        style={{ boxShadow: 'inset 0 0 0 1px #ece6f3' }}
      >
        <MagnifyingGlass size={12} weight="bold" />
        {open ? 'Hide evidence' : 'Show evidence'}
        {open ? (
          <CaretUp size={10} weight="bold" />
        ) : (
          <CaretDown size={10} weight="bold" />
        )}
      </button>

      {open && (
        <div
          className="relative mt-4 overflow-hidden rounded-[14px] px-6 py-6 text-white"
          style={{
            background:
              'radial-gradient(120% 90% at 88% -10%, #1B0F39 0%, #0A0814 55%, #050310 100%)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 36px -24px rgba(15,10,30,0.45)',
          }}
        >
          {/* Top-right purple bloom (mirrors hero) */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[280px] w-[280px] rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(127,90,240,0.20) 0%, rgba(127,90,240,0.06) 40%, transparent 70%)',
            }}
          />
          {/* Subtle grain */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)',
              backgroundSize: '3px 3px',
              mixBlendMode: 'screen',
            }}
          />

          <div className="relative">
            {/* Specialist + sample */}
            <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <EvidenceMetaItem icon={<Cpu size={11} weight="bold" />} label="Specialist">
                {evidence.specialist}
              </EvidenceMetaItem>
              <EvidenceMetaItem icon={<Database size={11} weight="bold" />} label="Sample">
                {evidence.totalSamples}
              </EvidenceMetaItem>
            </div>

            {/* Tools */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/55">
                Tools used
              </span>
              {evidence.tools.map((t) => (
                <code
                  key={t}
                  className="rounded-[6px] px-[8px] py-[3px] text-[11.5px] font-medium"
                  style={{
                    background: 'rgba(127,90,240,0.18)',
                    color: '#C9B5FF',
                    boxShadow: 'inset 0 0 0 1px rgba(159,134,255,0.30)',
                  }}
                >
                  {t}
                </code>
              ))}
            </div>

            {/* Sample data table */}
            <div className="mb-5">
              <div className="mb-2 text-[11px] font-semibold text-white/60">
                Sample data
              </div>
              <div
                className="overflow-hidden rounded-[10px]"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              >
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr>
                      {evidence.table.columns.map((c) => (
                        <th
                          key={c}
                          className="px-4 py-[10px] text-left text-[10.5px] font-bold uppercase tracking-[0.06em] text-white/55"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evidence.table.rows.map((row, i) => (
                      <tr
                        key={i}
                        style={
                          i < evidence.table.rows.length - 1
                            ? { borderBottom: '1px solid rgba(255,255,255,0.05)' }
                            : undefined
                        }
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className="px-4 py-[10px] text-white/85"
                            style={j === 0 ? undefined : { fontVariantNumeric: 'tabular-nums' }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {evidence.table.moreCount && (
                  <div
                    className="px-4 py-[9px] text-[12px] text-white/50"
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    + {evidence.table.moreCount} more rows
                  </div>
                )}
              </div>
            </div>

            {/* AI judgment */}
            <div
              className="rounded-[10px] px-5 py-4"
              style={{
                background: 'rgba(255,255,255,0.03)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-start gap-3">
                <Quotes
                  size={16}
                  weight="fill"
                  className="mt-[2px] shrink-0"
                  style={{ color: '#9F86FF' }}
                />
                <div className="min-w-0">
                  <div className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/55">
                    AI judgment
                  </div>
                  <p className="text-[13px] leading-[1.55] text-white/90">
                    {evidence.judgment}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceMetaItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="grid h-[20px] w-[20px] place-items-center rounded-[5px]"
        style={{
          background: 'rgba(127,90,240,0.20)',
          color: '#C9B5FF',
          boxShadow: 'inset 0 0 0 1px rgba(159,134,255,0.25)',
        }}
      >
        {icon}
      </span>
      <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/55">
        {label}
      </span>
      <span className="text-[13px] font-semibold text-white">{children}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Methodology view
// ════════════════════════════════════════════════════════════════════════

export function MethodologyView({
  methodology,
}: {
  methodology: ReportConfig['methodology'];
}) {
  return (
    <div className="mb-7 space-y-6">
      <section
        className="rounded-[16px] bg-white px-7 py-7"
        style={{
          boxShadow:
            '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02), 0 18px 32px -24px rgba(15,10,30,0.12)',
        }}
      >
        <div className="mb-6 flex items-start gap-4">
          <MethodShield />
          <div className="min-w-0 flex-1">
            <h3 className="ppc-h3 text-ppc-ink">
              How this agent works
            </h3>
            <p className="mt-1 max-w-[640px] text-[14px] leading-[1.55] text-ppc-text-muted">
              {methodology.intro}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {methodology.runtime.map((r, i) => (
            <RuntimeStat key={i} value={r.value} label={r.label} />
          ))}
        </div>
      </section>

      <section
        className="rounded-[16px] bg-white px-7 py-7"
        style={{
          boxShadow:
            '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02), 0 18px 32px -24px rgba(15,10,30,0.12)',
        }}
      >
        <h3 className="ppc-h3 mb-1 text-ppc-ink">
          Specialists
        </h3>
        <p className="mb-5 text-[13px] text-ppc-text-muted">
          {methodology.specialistsIntro}
        </p>
        <div className="space-y-4">
          {methodology.specialists.map((s, i) => (
            <SpecialistRow key={i} {...s} />
          ))}
        </div>
      </section>

      <section
        className="rounded-[16px] px-7 py-6"
        style={{
          background: '#F7F4FD',
          boxShadow: 'inset 0 0 0 1px #e6dff4',
        }}
      >
        <div className="flex items-start gap-3">
          <Clock size={18} weight="bold" className="mt-[2px] shrink-0" style={{ color: '#7F5AF0' }} />
          <div className="min-w-0">
            <h4 className="ppc-h4 text-ppc-ink">
              Data freshness
            </h4>
            <p className="mt-1 text-[13px] leading-[1.55] text-ppc-text-muted">
              {methodology.freshness}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MethodShield() {
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

function RuntimeStat({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded-[12px] px-5 py-4"
      style={{
        background: '#FAF7FB',
        boxShadow: 'inset 0 0 0 1px #eae3f1',
      }}
    >
      <div className="ppc-h2 text-ppc-ink tabular-nums">
        {value}
      </div>
      <p className="mt-2 text-[12px] text-ppc-text-muted">{label}</p>
    </div>
  );
}

function SpecialistRow({
  icon,
  name,
  role,
  tools,
}: {
  icon: Section['icon'];
  name: string;
  role: string;
  tools: string[];
}) {
  return (
    <div
      className="rounded-[12px] px-5 py-4"
      style={{
        background: '#FAF7FB',
        boxShadow: 'inset 0 0 0 1px #eae3f1',
      }}
    >
      <div className="flex items-start gap-4">
        <SectionIcon kind={icon} />
        <div className="min-w-0 flex-1">
          <h4 className="ppc-h4 text-ppc-ink">
            {name}
          </h4>
          <p className="mt-1 text-[13px] leading-[1.55] text-ppc-text-muted">
            {role}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {tools.map((t) => (
              <code
                key={t}
                className="rounded-[6px] px-[8px] py-[3px] text-[11.5px] font-medium text-ppc-purple-600"
                style={{
                  background: '#EFE9FA',
                  boxShadow: 'inset 0 0 0 1px rgba(127,90,240,0.14)',
                }}
              >
                {t}
              </code>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Mascots
// ════════════════════════════════════════════════════════════════════════
//
// Each agent gets a hero illustration on the dark card. CompetitorSpy uses
// the bespoke SpyMascot (fedora + binoculars). Add more here as new
// agent-specific reports come online.

function CompetitorSpyHero() {
  return (
    <div className="scale-[0.88] origin-right">
      <SpyMascot />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Competitor Spy · report config
// ════════════════════════════════════════════════════════════════════════

const COMPETITOR_SPY_SUMMARY: SummaryData = {
  verdict: {
    statement:
      'Competitor pressure is costing visibility on your highest-intent terms.',
    actionsReady: 1,
    actionsReview: 2,
    risk:
      'Bid changes depend on the campaign bidding strategy — confirm the right control lever before touching bids.',
  },

  // Order: safest → riskiest. Lead with "Ready to export" so the user
  // sees the immediate win before the actions that need judgment.
  actions: [
    {
      category: 'Negatives',
      title: 'Add negative keywords to reduce wasted spend',
      readiness: 'ready',
      badges: [
        { label: 'Low risk',  tone: 'risk-low' },
        { label: '24 terms',  tone: 'count' },
      ],
      whyMatters:
        'Search terms with spend and no conversion signal are leaking budget from campaigns that should be cleaner. 24 queries converted at <0.5% over the last 60 days.',
      expected:
        'Redirect ~$420/mo back to converting terms without changing campaign structure or bidding strategy.',
      tradeoff:
        'Review ambiguous terms before upload — a handful look informational but may have defensive value during competitor surges.',
      primaryCta: 'Review 24 terms',
      secondaryCta: 'Export CSV',
    },
    {
      category: 'Bidding',
      title: 'Review bid pressure on 8 high-intent keywords',
      readiness: 'needs-review',
      badges: [
        { label: 'High impact',                 tone: 'impact-high' },
        { label: 'Bidding strategy check needed', tone: 'check' },
        { label: '8 keywords',                  tone: 'count' },
      ],
      whyMatters:
        'Rivals are outranking you by 1.5+ positions on terms where you already spend heavily. 41% spend overlap means you\'re fighting the same auctions on the same queries.',
      expected:
        '~$3.1K/mo upside if you recover impression share on the contested set — bid simulator confidence 84%.',
      tradeoff:
        'If these campaigns use Smart Bidding or a portfolio strategy, direct keyword bid changes may not be the right lever. tCPA, budget, or conversion-quality changes might be the actual control instead.',
      primaryCta: 'Review 8 keywords',
      secondaryCta: 'Check bidding strategy',
    },
    {
      category: 'Ad copy',
      title: 'Refresh headlines in high-overlap ad groups',
      readiness: 'needs-brand-review',
      badges: [
        { label: 'Copy drafts available', tone: 'meta' },
        { label: '3 ad groups',           tone: 'count' },
      ],
      whyMatters:
        'Top rivals open with the outcome the buyer wants ("$2M+ won for clients", "Get the settlement you deserve"). Your top ad groups lead with the service category — your two best-performing existing ads already use outcome framing, so this is a pattern, not a guess.',
      expected:
        '+64% impression-share lift modelled from rival ads with similar framing. 12 ready-to-test templates already extracted and de-duped.',
      tradeoff:
        'Drafts need a brand-voice + compliance pass before going live — bar-association rules on settlement claims and "guarantee" language vary by state.',
      primaryCta: 'Review draft headlines',
      secondaryCta: 'Edit with AI',
    },
  ],

  insights: [
    {
      title: 'Bidding gaps on core terms',
      whatWeSaw:
        '8 high-intent keywords are losing rank against the same 3 rivals across all 7 days sampled.',
      whyItMatters:
        'Lost visibility on commercial-intent terms flows directly to advertisers you already track — this is the spend you can recover fastest.',
      signal:
        '−1.8 avg position gap · $3.1K/mo modelled upside · 84% bid-simulator confidence',
      evidenceLabel: 'View evidence',
    },
    {
      title: 'Winning copy patterns',
      whatWeSaw:
        'Top rivals use outcome-led headlines ("$2M+ won", "settlement you deserve"). Your ads lead with category.',
      whyItMatters:
        'Specific, outcome-framed copy converts 64% more impression share in the same auctions you\'re already paying to enter.',
      signal:
        '47 unique RSAs sampled · 12 patterns identified · 3 repeat across all top rivals',
      evidenceLabel: 'View examples',
    },
    {
      title: 'Auction overlap risk',
      whatWeSaw:
        '5 rivals overlap with you on 41% of spend; 3 of them are growing month-over-month.',
      whyItMatters:
        'The CPC pressure is concentrated, not random — the same rivals are pushing prices on the auctions you most need to win.',
      signal:
        '41% overlap rate · 5 rivals · +28% CPC vs uncontested terms',
      evidenceLabel: 'View rivals',
    },
  ],

  checks: [
    {
      title: 'Confirm bidding strategy',
      body:
        'We need to confirm whether the 3 affected campaigns use Manual CPC, Smart Bidding (tCPA/tROAS), or a portfolio strategy. Bid changes only make sense for Manual CPC — for Smart Bidding the right lever is target CPA, budget, or conversion-quality adjustments.',
    },
    {
      title: 'Clarify defensive search terms',
      body:
        'A handful of the 24 zero-conversion terms (e.g. "free injury lawyer", "injury lawyer near me free") may be intentional defensive coverage rather than waste. Confirm intent before excluding so we don\'t cede those impressions to a rival.',
    },
  ],
};

const COMPETITOR_SPY_METHODOLOGY: ReportConfig['methodology'] = {
  intro:
    'Competitor Spy is an orchestration of four specialists, each focused on a distinct question. Their findings are cross-checked before being ranked and presented in the Summary and Full Report.',
  runtime: [
    { value: '4',     label: 'Specialists'       },
    { value: '161',   label: 'Tool invocations'  },
    { value: '7-day', label: 'Lookback window'   },
  ],
  specialistsIntro:
    'Each runs independently with its own tool set, then hands findings to Strategy Synthesis.',
  specialists: [
    {
      icon: 'target',
      name: 'Competitor Discovery',
      role: 'Identifies who you\'re competing against and quantifies their scale.',
      tools: ['serp_api.search', 'web.scrape', 'domain.lookup', 'google_ads.auction_insights'],
    },
    {
      icon: 'binoculars',
      name: 'Auction Intelligence',
      role: 'Measures head-to-head performance across every shared auction.',
      tools: ['google_ads.auction_insights', 'google_ads.report', 'google_ads.bid_simulator'],
    },
    {
      icon: 'chart',
      name: 'Copy Pattern Analysis',
      role: 'Extracts winning patterns from rival ad copy and your own history.',
      tools: ['web.scrape', 'content.classifier', 'content.template_extractor', 'google_ads.search_term_report'],
    },
    {
      icon: 'flag',
      name: 'Strategy Synthesis',
      role: 'Ranks recommendations by impact × confidence, validates with simulators.',
      tools: ['google_ads.bid_simulator', 'google_ads.search_term_report'],
    },
  ],
  freshness:
    'Auction insights and search-term reports are pulled live from the Google Ads API. Rival ad-copy samples are scraped within the run and cached for 24 hours. Re-run the agent to refresh.',
};

const COMPETITOR_SPY_REPORT: ReportConfig = {
  generated: { date: 'May 13, 2025', time: '2:14 PM' },
  mascot: () => <CompetitorSpyHero />,
  summary: COMPETITOR_SPY_SUMMARY,
  fullReport: COMPETITOR_SPY_FULL_REPORT,
  methodology: COMPETITOR_SPY_METHODOLOGY,
};

// Map of run-id → report config. Runs without an entry fall back to the
// generic StagePage canvas in AgentResults().
export const REPORT_CONFIGS: Record<string, ReportConfig> = {
  'run-competitor-spy-completed': COMPETITOR_SPY_REPORT,
};

