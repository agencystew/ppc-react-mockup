import { useState } from 'react';
import {
  Check, ArrowRight, ArrowUpRight, CaretDown, CaretUp, Waveform,
} from '@phosphor-icons/react';
import type {
  AgentRun,
  AgentStageRunning,
  AgentStageCompleted,
  AgentStageUpcoming,
  MissionFeedStep,
  StatTile,
  Finding,
  DataSource,
  ActionButton as ActionBtn,
  DataPreviewTable,
} from '../types/agent';

// StagePage — the storytelling-with-receipts canvas.
//
// Two distinct shells — RUNNING (smoky-black, rounded-3xl, kept intact)
// and COMPLETED (pure black, rounded-16px, per v5 source artifact
// docs/design-system/v5-source-artifacts/05-agent-report.html).
//
// COMPLETED layout:
//   header (icon + name | check + COMPLETED · 47 MIN)
//   hero (giant headline w/ purple period + description max-w 88%)
//   3 stat cards (flat white/4 bg, white/8 border, suffix supported)
//   "What the team found" section (findings with left 3px purple border)
//   "Audit the work" reveal (solid #1F1342 card with purple/28 border)
//   3 action buttons (flat purple primary, white/6 secondary)
export function StagePage({ run }: { run: AgentRun }) {
  if (run.status === 'completed') return <CompletedCanvas run={run} />;
  return <RunningCanvas run={run} />;
}

// ════════════════════════════════════════════════════════════════════════
// COMPLETED canvas — full rewrite per v5 source artifact
// ════════════════════════════════════════════════════════════════════════

function CompletedCanvas({ run }: { run: AgentRun }) {
  return (
    <div className="relative overflow-hidden rounded-[16px] bg-black px-10 py-12 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-[380px] w-[380px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.16) 0%, transparent 60%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-[10%] h-[240px] w-[240px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.06) 0%, transparent 65%)' }}
      />
      <CompletedHeader run={run} />
      <CompletedHero headline={run.headline} description={run.description} />
      {run.stats && run.stats.length > 0 && <StatGrid stats={run.stats} />}
      {run.findings && run.findings.length > 0 && <FindingsSection findings={run.findings} />}
      {run.dataSources && run.dataSources.length > 0 && <AuditTheWork dataSources={run.dataSources} />}
      {run.actions && run.actions.length > 0 && <ActionsRow actions={run.actions} />}
    </div>
  );
}

function CompletedHeader({ run }: { run: AgentRun }) {
  return (
    <div className="relative mb-11 flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center gap-2.5 text-[15px] font-medium text-white">
        <span className="text-[20px] leading-none">{run.parentAgent.icon}</span>
        {run.parentAgent.name}
      </div>
      <div className="inline-flex items-center gap-2.5">
        <span className="grid h-[18px] w-[18px] place-items-center rounded-full border border-ppc-status-healthy/50 bg-ppc-status-healthy/20">
          <Check size={11} weight="bold" className="text-ppc-status-healthy" />
        </span>
        <span className="font-mono text-[12px] uppercase tracking-[0.10em] text-ppc-text-on-dark">
          Completed · {run.totalDuration}
        </span>
      </div>
    </div>
  );
}

function CompletedHero({ headline, description }: { headline: string; description: string }) {
  const hasPeriod = headline.endsWith('.');
  const body = hasPeriod ? headline.slice(0, -1) : headline;
  return (
    <div className="relative mb-10">
      <h1 className="font-display text-[48px] font-extrabold leading-[1.0] tracking-[-0.03em] text-white sm:text-[64px]">
        {body}{hasPeriod && <span className="text-ppc-purple-500">.</span>}
      </h1>
      <p className="mt-5 max-w-[88%] text-[16px] leading-[1.5] text-ppc-text-on-dark">
        {description}
      </p>
    </div>
  );
}

function StatGrid({ stats }: { stats: StatTile[] }) {
  return (
    <div
      className="relative mb-11 grid gap-3"
      style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
    >
      {stats.map((s, i) => <StatCardNew key={i} {...s} />)}
    </div>
  );
}

function StatCardNew({ value, label }: StatTile) {
  // Detect a trailing "/word" suffix (e.g. "$8.2K/mo") so we can shrink it.
  const match = value.match(/^(.+?)(\/\w+)$/);
  const main = match ? match[1] : value;
  const suffix = match ? match[2] : null;
  return (
    <div className="rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-5 py-[22px]">
      <div className="font-display text-[44px] font-extrabold leading-[1.0] tracking-[-0.025em] text-white">
        {main}
        {suffix && (
          <span className="text-[18px] font-medium text-ppc-text-on-dark">{suffix}</span>
        )}
      </div>
      <p className="mt-3.5 text-[12px] leading-[1.5] text-ppc-text-on-dark">{label}</p>
    </div>
  );
}

function FindingsSection({ findings }: { findings: Finding[] }) {
  return (
    <div className="relative mb-6">
      <p className="mb-4 text-[14px] text-ppc-text-on-dark">What the team found</p>
      <div className="flex flex-col gap-3">
        {findings.map((f, i) => <FindingCardNew key={i} {...f} />)}
      </div>
    </div>
  );
}

function FindingCardNew({ agent, finding, priority, impact, action }: Finding) {
  return (
    <div
      className="rounded-[8px] border border-white/[0.06] bg-white/[0.03] px-6 py-[22px]"
      style={{ borderLeft: '3px solid #7F5AF0' }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.10em] text-[#c4b5fd]">{agent}</p>
        {priority && <PriorityChip priority={priority} />}
      </div>
      <p className="text-[14px] leading-[1.65] text-white">{finding}</p>
      {(impact || action) && (
        <div className="mt-[18px] flex flex-wrap items-center justify-between gap-3 border-t-[0.5px] border-white/[0.08] pt-[14px]">
          {impact && (
            <p className="inline-flex items-center gap-1.5 text-[12px] text-ppc-text-on-dark">
              <ArrowUpRight size={14} weight="bold" className="text-ppc-status-healthy" />
              {impact}
            </p>
          )}
          {action && (
            <button
              type="button"
              className="text-[12px] font-medium text-[#c4b5fd] transition-colors hover:text-white"
            >
              {action} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PriorityChip({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const styles = {
    high:   { bg: 'rgba(226,75,74,0.15)',  border: 'rgba(226,75,74,0.30)',  fg: '#F09595' },
    medium: { bg: 'rgba(186,117,23,0.15)', border: 'rgba(186,117,23,0.30)', fg: '#EF9F27' },
    low:    { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', fg: '#b8aeda' },
  }[priority];
  const label = priority === 'high' ? 'HIGH PRIORITY' : priority === 'medium' ? 'MED PRIORITY' : 'LOW PRIORITY';
  return (
    <span
      className="shrink-0 rounded-[4px] border px-[9px] py-[4px] text-[10px] font-medium tracking-[0.08em]"
      style={{ background: styles.bg, borderColor: styles.border, color: styles.fg }}
    >
      {label}
    </span>
  );
}

// ─── Audit the work ──────────────────────────────────────────────────────

function AuditTheWork({ dataSources }: { dataSources: DataSource[] }) {
  const [open, setOpen] = useState(false);
  const totalCalls = dataSources.reduce((s, x) => s + (x.toolCallCount || 0), 0);
  const allTools = dataSources.flatMap((s) => s.tools || []);
  const remaining = Math.max(0, allTools.length - 4);

  return (
    <div
      className="relative mb-6 rounded-[12px] border px-[26px] py-6"
      style={{ background: '#1F1342', borderColor: 'rgba(127,90,240,0.28)' }}
    >
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h3 className="text-[18px] font-medium text-white">Audit the work</h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-ppc-purple-500/30 bg-ppc-purple-500/20 px-3.5 py-[7px] text-[12px] font-medium text-white transition-colors hover:bg-ppc-purple-500/30"
        >
          {open ? 'Close' : 'Reveal'}
          {open
            ? <CaretUp size={12} weight="bold" />
            : <CaretDown size={12} weight="bold" />}
        </button>
      </div>

      <p className="mb-4 text-[13px] leading-[1.65] text-ppc-text-on-dark">
        Every API call, every data point, every AI judgment.{' '}
        <span className="font-medium text-white">
          {totalCalls} tool invocations across {dataSources.length} specialists.
        </span>{' '}
        Inspect the methodology, audit the source tables, export the raw data.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {allTools.slice(0, 4).map((t, i) => <ToolPillNew key={i}>{t}</ToolPillNew>)}
      </div>
      {!open && remaining > 0 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 text-[12px] text-ppc-text-on-dark transition-colors hover:text-white"
        >
          + {remaining} more tools
        </button>
      )}

      {open && (
        <div
          className="mt-[22px] flex flex-col gap-[26px] border-t-[0.5px] pt-[22px]"
          style={{ borderColor: 'rgba(127,90,240,0.18)' }}
        >
          {dataSources.map((s, i) => <DataSourceCardNew key={i} {...s} />)}
        </div>
      )}
    </div>
  );
}

function ToolPillNew({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-[6px] border px-2.5 py-[5px] font-mono text-[11px] text-[#c4b5fd]"
      style={{ background: 'rgba(127,90,240,0.12)', borderColor: 'rgba(127,90,240,0.28)' }}
    >
      {children}
    </span>
  );
}

function DataSourceCardNew({
  agent, tools, toolCallCount, dataPointsLabel, summary, dataPreview,
}: DataSource) {
  return (
    <div>
      <p className="text-[15px] font-medium text-white">{agent}</p>
      <p className="mt-1 text-[12px] text-ppc-text-on-dark">
        {toolCallCount} tool calls · {dataPointsLabel}
      </p>
      {tools && tools.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {tools.map((t, i) => <ToolPillNew key={i}>{t}</ToolPillNew>)}
        </div>
      )}
      {summary && (
        <p className="mt-3.5 text-[13px] leading-[1.65] text-ppc-text-on-dark">{summary}</p>
      )}
      {dataPreview && (
        <div className="mt-[18px]">
          <DataPreviewNew {...dataPreview} />
        </div>
      )}
    </div>
  );
}

function DataPreviewNew({ headers, rows, moreCount, moreLabel }: DataPreviewTable) {
  // Use a 1fr column for the first (label) cell, narrower fr for the rest.
  const cols = `2fr ${'1fr '.repeat(Math.max(0, headers.length - 1)).trim()}`;
  return (
    <div
      className="rounded-[10px] border-[0.5px] px-4 py-3.5"
      style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(127,90,240,0.15)' }}
    >
      <div
        className="grid gap-3 border-b-[0.5px] pb-2.5"
        style={{ gridTemplateColumns: cols, borderColor: 'rgba(127,90,240,0.12)' }}
      >
        {headers.map((h, i) => (
          <p
            key={i}
            className="font-mono text-[10px] uppercase tracking-[0.08em] text-ppc-text-on-dark"
          >
            {h}
          </p>
        ))}
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className="grid gap-3 py-2"
          style={{
            gridTemplateColumns: cols,
            borderBottom: i === rows.length - 1 ? 'none' : '0.5px solid rgba(127,90,240,0.08)',
          }}
        >
          {row.map((cell, j) => (
            <p
              key={j}
              className={
                j === 0
                  ? 'text-[13px] font-medium text-white'
                  : 'font-mono text-[12px] text-ppc-text-on-dark'
              }
            >
              {cell}
            </p>
          ))}
        </div>
      ))}
      {moreCount ? (
        <div
          className="mt-1 flex items-center justify-between border-t-[0.5px] pt-3"
          style={{ borderColor: 'rgba(127,90,240,0.12)' }}
        >
          <p className="text-[11px] text-ppc-text-on-dark">
            + {moreCount.toLocaleString()} more {moreLabel || 'rows'}
          </p>
          <button type="button" className="text-[12px] font-medium text-[#c4b5fd] hover:underline">
            View all →
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ActionsRow({ actions }: { actions: ActionBtn[] }) {
  return (
    <div className="relative flex flex-wrap items-center gap-2.5">
      {actions.map((a, i) => <ActionButtonNew key={i} {...a} />)}
    </div>
  );
}

function ActionButtonNew({ label, primary }: ActionBtn) {
  if (primary) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-[10px] bg-ppc-purple-500 px-[22px] py-[14px] text-[14px] font-medium text-white transition-colors hover:bg-ppc-purple-600"
      >
        {label}
        <ArrowRight size={14} weight="bold" />
      </button>
    );
  }
  return (
    <button
      type="button"
      className="inline-flex items-center rounded-[10px] border border-white/[0.12] bg-white/[0.06] px-5 py-[14px] text-[14px] font-medium text-white transition-colors hover:bg-white/[0.10]"
    >
      {label}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════
// RUNNING view — light-surface layout (hero on canvas, dark mission feed
// card, stage-level Completed + Up next sections, lavender callout).
// Matches the pixel-perfect design Stewart shipped on 2026-05-15.
// ════════════════════════════════════════════════════════════════════════

function RunningCanvas({ run }: { run: AgentRun }) {
  const current = run.stage.current;
  return (
    <div className="space-y-10">
      <RunningHero headline={run.headline} />

      {run.activeAgent && (
        <MissionFeedCard
          active={run.activeAgent}
          recentSteps={run.recentMissionSteps ?? []}
        />
      )}

      {run.completedStages && run.completedStages.length > 0 && (
        <CompletedStagesSection stages={run.completedStages} />
      )}

      {run.upcomingStages && run.upcomingStages.length > 0 && (
        <UpcomingStagesSection
          stages={run.upcomingStages}
          startNumber={current + 1}
          moreCount={run.moreUpcomingCount}
        />
      )}

      {run.liveSignalsLabel && <LiveSignalsCallout label={run.liveSignalsLabel} />}
    </div>
  );
}

// ─── Hero on canvas ──────────────────────────────────────────────────────

function RunningHero({ headline }: { headline: string }) {
  const hasPeriod = headline.endsWith('.');
  const body = hasPeriod ? headline.slice(0, -1) : headline;
  return (
    <div>
      <h1 className="font-display text-[64px] font-extrabold leading-[1.04] tracking-[-0.035em] text-ppc-ink sm:text-[72px]">
        {body}
        {hasPeriod && <span style={{ color: '#7F5AF0' }}>.</span>}
      </h1>
    </div>
  );
}

// ─── Mission-feed card ───────────────────────────────────────────────────
//
// World-class redesign 2026-05-15: replaces the dark "Spotify radio" panel
// with an editorial white card in keeping with the rest of PPC.io's app
// system. Active operation sits in a soft lavender wash at the top (where
// the live work is happening); the receipts trail flows below on white.
// One subtle Running pulse — no NOW/ACTIVE chips, no waveform mascot, no
// "in progress" label. Calm and high-signal.

function MissionFeedCard({
  active, recentSteps,
}: {
  active: AgentStageRunning;
  recentSteps: MissionFeedStep[];
}) {
  return (
    <section
      className="overflow-hidden rounded-[16px] bg-white"
      style={{
        boxShadow:
          '0 0 0 1px #e7e2ef, 0 1px 0 rgba(15,10,30,0.02), 0 18px 32px -24px rgba(15,10,30,0.10)',
      }}
    >
      <ActivePanel active={active} />
      <StepsTrail steps={recentSteps} />
    </section>
  );
}

function ActivePanel({ active }: { active: AgentStageRunning }) {
  const progress = Math.max(0, Math.min(100, active.progressPct ?? 0));
  return (
    <div
      className="relative overflow-hidden px-7 pb-6 pt-[22px] sm:px-8"
      style={{
        background:
          'linear-gradient(160deg, #F2EEFB 0%, #ECE7FB 60%, #E6DEFB 100%)',
      }}
    >
      {/* Soft purple bloom in the top-right — gives the live region depth
          without dragging the surface into a dark hero. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[280px] w-[280px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(127,90,240,0.18) 0%, transparent 60%)',
        }}
      />

      <div className="relative flex flex-wrap items-baseline justify-between gap-3">
        <RunningChip />
        <span className="tabular-nums text-[15px] font-semibold tracking-[-0.005em] text-ppc-ink">
          {active.elapsed}
        </span>
      </div>

      <p className="relative mt-[14px] max-w-[640px] text-[16px] leading-[1.55] text-ppc-ink">
        {active.task}
      </p>

      <div
        className="relative mt-5 h-[5px] overflow-hidden rounded-full"
        style={{ background: 'rgba(255,255,255,0.65)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background:
              'linear-gradient(90deg, #A88CFF 0%, #7F5AF0 60%, #534AB7 100%)',
            boxShadow: '0 0 10px rgba(127,90,240,0.40)',
          }}
        />
      </div>
    </div>
  );
}

function RunningChip() {
  return (
    <span
      className="inline-flex items-center gap-[8px] text-[11px] font-semibold uppercase leading-none tracking-[0.18em]"
      style={{
        color: '#534AB7',
        fontFamily: '"Courier New", ui-monospace, Menlo, monospace',
      }}
    >
      <span
        className="ppcio-live-dot inline-block h-[7px] w-[7px] rounded-full"
        style={{
          background: '#7F5AF0',
          boxShadow: '0 0 0 3px rgba(127,90,240,0.18)',
        }}
      />
      Running
    </span>
  );
}

function StepsTrail({ steps }: { steps: MissionFeedStep[] }) {
  if (steps.length === 0) return null;
  return (
    <ul className="px-7 py-2 sm:px-8">
      {steps.map((s, i) => (
        <StepRow key={i} step={s} isLast={i === steps.length - 1} />
      ))}
    </ul>
  );
}

function StepRow({ step, isLast }: { step: MissionFeedStep; isLast: boolean }) {
  return (
    <li
      className="flex items-start gap-4 py-[14px]"
      style={{ borderBottom: isLast ? 'none' : '0.5px solid #eee9f5' }}
    >
      <span
        className="mt-[3px] grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full"
        style={{
          background: '#E6F7EE',
          boxShadow: 'inset 0 0 0 1px rgba(63,170,120,0.25)',
        }}
      >
        <Check size={11} weight="bold" style={{ color: '#1F8A5A' }} />
      </span>
      <span
        className="tabular-nums shrink-0 pt-[3px] text-[12px] font-medium"
        style={{
          color: '#9890ad',
          fontFamily: '"Courier New", ui-monospace, Menlo, monospace',
          width: 58,
        }}
      >
        {step.time}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[14px] font-semibold tracking-[-0.005em] text-ppc-ink">
          {step.title}
        </p>
        <p className="mt-[3px] text-[13px] leading-[1.5] text-ppc-text-muted">
          {step.description}
        </p>
      </div>
    </li>
  );
}

// ─── Stage-level Completed section ──────────────────────────────────────

function CompletedStagesSection({ stages }: { stages: AgentStageCompleted[] }) {
  return (
    <div>
      <p className="mb-5 text-[15px] font-semibold tracking-[-0.005em] text-ppc-ink">Completed</p>
      <div className="relative pl-[14px]">
        <span
          aria-hidden
          className="pointer-events-none absolute left-[14px] top-[18px] w-[2px]"
          style={{
            background: 'linear-gradient(180deg, rgba(93,202,165,0.55) 0%, rgba(93,202,165,0.10) 100%)',
            height: `calc(100% - 36px)`,
          }}
        />
        <ul className="flex flex-col gap-[14px]">
          {stages.map((s, i) => (
            <li key={i} className="relative flex items-center gap-4">
              <span
                className="relative z-[1] grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full text-white"
                style={{
                  background: 'linear-gradient(155deg, #6DD3AB 0%, #4FB390 100%)',
                  boxShadow:
                    '0 0 0 3px #F3F0FF, 0 4px 10px -3px rgba(79,179,144,0.45)',
                }}
              >
                <Check size={13} weight="bold" />
              </span>
              <span className="w-[16px] shrink-0 text-[14px] font-semibold tabular-nums text-ppc-ink/55">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[15px] font-semibold tracking-[-0.005em] text-ppc-ink">
                  {s.title}
                </p>
                <p className="mt-[2px] text-[13px] text-ppc-purple-700/85">{s.agent}</p>
              </div>
              <span className="shrink-0 tabular-nums text-[13px] font-medium text-ppc-ink/55">
                {s.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Stage-level Up next section ────────────────────────────────────────

function UpcomingStagesSection({
  stages, startNumber, moreCount,
}: {
  stages: AgentStageUpcoming[];
  startNumber: number;
  moreCount?: number;
}) {
  return (
    <div>
      <p className="mb-5 text-[15px] font-semibold tracking-[-0.005em] text-ppc-ink">Up next</p>
      <div className="pl-[14px]">
        <ul className="flex flex-col gap-[14px]">
          {stages.map((s, i) => (
            <li key={i} className="flex items-center gap-4">
              <span
                className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full text-[12px] font-semibold tabular-nums text-ppc-ink/65"
                style={{
                  background: '#F2EFFB',
                  boxShadow: 'inset 0 0 0 1px rgba(15,10,30,0.08)',
                }}
              >
                {startNumber + i}
              </span>
              <span aria-hidden className="text-[13px] text-ppc-ink/30">·</span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[15px] font-semibold tracking-[-0.005em] text-ppc-ink">
                  {s.title}
                </p>
                <p className="mt-[2px] text-[13px] text-ppc-purple-700/85">{s.agent}</p>
              </div>
            </li>
          ))}
        </ul>
        {moreCount ? (
          <p className="mt-3 pl-[44px] text-[13px] font-medium text-ppc-ink/45">
            + {moreCount} more stages
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ─── Lavender bottom callout ────────────────────────────────────────────

function LiveSignalsCallout({ label }: { label: string }) {
  return (
    <div
      className="relative flex items-center gap-5 overflow-hidden rounded-[16px] px-6 py-5"
      style={{ background: '#ECE7FB' }}
    >
      <span
        className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 0 0 1px rgba(127,90,240,0.18), 0 6px 16px -6px rgba(127,90,240,0.30)',
        }}
      >
        <Waveform size={22} weight="bold" style={{ color: '#7F5AF0' }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold tracking-[-0.005em] text-ppc-ink">{label}</p>
        <p className="mt-[3px] text-[13.5px] text-ppc-ink/55">
          New insights will appear in your report as they're ready.
        </p>
      </div>
      <CalloutSparkline />
    </div>
  );
}

function CalloutSparkline() {
  return (
    <svg
      width="220"
      height="60"
      viewBox="0 0 220 60"
      aria-hidden
      fill="none"
      className="pointer-events-none shrink-0"
    >
      <defs>
        <linearGradient id="cs-stroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7F5AF0" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#7F5AF0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#7F5AF0" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="cs-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7F5AF0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7F5AF0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M2 46 Q 24 32, 38 36 T 72 22 T 108 32 T 142 14 T 176 28 T 218 18"
        stroke="url(#cs-stroke)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M2 46 Q 24 32, 38 36 T 72 22 T 108 32 T 142 14 T 176 28 T 218 18 L 218 58 L 2 58 Z"
        fill="url(#cs-fill)"
      />
      <circle cx="72"  cy="22" r="2.5" fill="#7F5AF0" />
      <circle cx="142" cy="14" r="2.5" fill="#7F5AF0" />
      <circle cx="218" cy="18" r="2.5" fill="#7F5AF0" />
    </svg>
  );
}
