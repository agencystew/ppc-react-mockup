import { useState } from 'react';
import {
  Check, ArrowRight, ArrowUpRight, CaretDown, CaretUp,
} from '@phosphor-icons/react';
import type {
  AgentRun,
  AgentStageCompleted,
  AgentStageUpcoming,
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
// RUNNING canvas — preserved verbatim (still wired through AgentRunning)
// ════════════════════════════════════════════════════════════════════════

function RunningCanvas({ run }: { run: AgentRun }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-ppc-black px-12 py-12 text-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-14 md:px-14"
      style={{
        backgroundImage:
          'radial-gradient(120% 80% at 20% 0%, rgba(128,87,255,0.10) 0%, transparent 55%)',
      }}
    >
      <RunningHeader run={run} />
      <RunningBody run={run} />
    </div>
  );
}

function RunningHeader({ run }: { run: AgentRun }) {
  return (
    <div className="mb-14 flex flex-wrap items-start justify-between gap-4">
      <div className="inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
        <span className="text-[20px] leading-none drop-shadow-[0_2px_8px_rgba(128,87,255,0.25)]">
          {run.parentAgent.icon}
        </span>
        {run.parentAgent.name}
      </div>
      <div className="inline-flex items-center gap-2.5 text-[12px] text-white/60">
        <span className="ppcio-live-dot inline-block h-2 w-2 rounded-full bg-ppc-purple-500" />
        <span className="font-medium uppercase tracking-wider">Running</span>
        <span className="opacity-40">·</span>
        <span>Stage {run.stage.current} of {run.stage.total}</span>
      </div>
    </div>
  );
}

function RunningBody({ run }: { run: AgentRun }) {
  const completed = run.completedStages ?? [];
  const upcoming = run.upcomingStages ?? [];
  return (
    <>
      <RunningHero headline={run.headline} description={run.description} />

      {run.activeAgent && (
        <div
          className="ppcio-agent-card relative mb-7 flex items-center gap-4 overflow-hidden rounded-2xl border border-ppc-purple-500/25 p-5"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(128,87,255,0.14) 0%, rgba(128,87,255,0.05) 55%, rgba(255,255,255,0.025) 100%)',
          }}
        >
          <span className="pointer-events-none absolute left-6 right-6 top-0 h-px bg-grad-sheen" />
          <Avatar initial={run.activeAgent.initial} />
          <div className="flex-1 leading-tight">
            <div className="text-[15px] font-semibold tracking-tight text-white">
              {run.activeAgent.role}
            </div>
            <div className="mt-0.5 text-[13.5px] text-white/75">{run.activeAgent.task}</div>
          </div>
          <div className="tabular text-[13px] font-medium text-ppc-purple-300">
            {run.activeAgent.elapsed}
          </div>
        </div>
      )}

      <div className="relative mb-14 h-1 overflow-hidden rounded-full bg-white/5">
        <div
          className="ppcio-live-bar h-full rounded-full shadow-[0_0_12px_rgba(128,87,255,0.45)]"
          style={{ width: `${run.progressPct ?? 0}%` }}
        />
      </div>

      {completed.length > 0 && (
        <div className="mb-12">
          <SectionLabel>Just completed</SectionLabel>
          <div className="flex flex-col gap-[18px]">
            {completed.map((c, i) => <CompletedRow key={i} {...c} />)}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <SectionLabel>Coming up next</SectionLabel>
          <div className="flex flex-col gap-[18px]">
            {upcoming.map((u, i) => <UpcomingRow key={i} {...u} />)}
            {run.moreUpcomingCount ? (
              <div className="pl-[38px] text-[12px] text-white/35">
                + {run.moreUpcomingCount} more checks
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

function RunningHero({ headline, description }: { headline: string; description: string }) {
  const hasPeriod = headline.endsWith('.');
  const body = hasPeriod ? headline.slice(0, -1) : headline;
  return (
    <div className="mb-12">
      <h1 className="font-display text-[64px] font-extrabold leading-[0.96] tracking-[-0.035em] text-white sm:text-[68px]">
        {body}{hasPeriod && <span className="text-ppc-purple-500">.</span>}
      </h1>
      <p className="mt-6 max-w-[560px] text-[18px] leading-[1.55] tracking-tight text-white/70">
        {description}
      </p>
    </div>
  );
}

function Avatar({ initial }: { initial: string }) {
  return (
    <span
      className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-full text-[15px] font-semibold text-white shadow-[0_6px_18px_-4px_rgba(128,87,255,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]"
      style={{
        backgroundImage:
          'linear-gradient(135deg, #A88CFF 0%, #8057FF 55%, #5A3FE0 100%)',
      }}
    >
      {initial}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[22px] text-[13px] font-medium tracking-tight text-white/70">
      {children}
    </div>
  );
}

function CompletedRow({ title, agent, time }: AgentStageCompleted) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-0.5 inline-grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-ppc-success text-white shadow-[0_2px_10px_-2px_rgba(23,178,106,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]">
        <Check size={13} weight="bold" />
      </span>
      <div className="flex-1 leading-tight">
        <div className="mb-0.5 text-[15px] font-medium text-white">{title}</div>
        <div className="text-[13px] text-white/70">{agent}</div>
      </div>
      <span className="tabular mt-1 text-[13px] font-medium text-white/70">{time}</span>
    </div>
  );
}

function UpcomingRow({ title, agent, dim }: AgentStageUpcoming) {
  return (
    <div className={`flex items-center gap-4 ${dim ? 'opacity-55' : ''}`}>
      <span className="inline-block h-[22px] w-[22px] shrink-0 rounded-full border-[1.5px] border-white/15" />
      <div className="leading-tight">
        <div className="mb-0.5 text-[15px] font-medium text-white">{title}</div>
        <div className="text-[13px] text-white/70">{agent}</div>
      </div>
    </div>
  );
}
