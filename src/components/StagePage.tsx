import { useState } from 'react';
import { Check, ArrowRight, CaretDown } from '@phosphor-icons/react';
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
// Ported from Stewart's stage-page JSX. Retrofitted to canonical brand:
//   Inter      → Figtree (via global body font)
//   #7C5CFC    → #8057FF (--ppc-purple-500)
//   #0A0A14    → #0C0C0E (--ppc-black "Smoky Black")
//   colored shadows on cards → cool-black per ANTI-PATTERNS.md §2
//
// This is THE differentiator surface: methodical named stages, per-stage
// duration, completed-state "Audit the work" reveal exposing every tool
// call + source table. Default view = outcome; receipts on demand.
export function StagePage({ run }: { run: AgentRun }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ppc-black px-12 py-12 text-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-14 md:px-14"
         style={{
           backgroundImage:
             'radial-gradient(120% 80% at 20% 0%, rgba(128,87,255,0.10) 0%, transparent 55%)',
         }}>
      <Header run={run} />
      {run.status === 'completed' ? <CompletedBody run={run} /> : <RunningBody run={run} />}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────
function Header({ run }: { run: AgentRun }) {
  const isCompleted = run.status === 'completed';
  return (
    <div className="mb-14 flex flex-wrap items-start justify-between gap-4">
      {/* Parent identity — bumped from 15px to 17px per Stewart's design note.
       *  This is the only thing telling you which agent you're inside; it
       *  needs to hold its own next to the 68px display H1 below. */}
      <div className="inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
        <span className="text-[20px] leading-none drop-shadow-[0_2px_8px_rgba(128,87,255,0.25)]">
          {run.parentAgent.icon}
        </span>
        {run.parentAgent.name}
      </div>

      {isCompleted ? (
        <div className="flex flex-col items-end gap-1">
          <div className="inline-flex items-center gap-2.5 text-[12px] text-white/60">
            <span className="inline-grid h-3.5 w-3.5 place-items-center rounded-full bg-ppc-success text-white shadow-[0_2px_8px_-2px_rgba(23,178,106,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]">
              <Check size={9} weight="bold" />
            </span>
            <span className="font-medium uppercase tracking-wider">Completed</span>
            <span className="opacity-40">·</span>
            <span className="tabular">{run.totalDuration}</span>
          </div>
          {/* Freshness stamp — when operators land on a shared report link,
           *  they want to know how fresh the data is. Per Stewart's design
           *  note 2026-05-14. Static for the mockup; in prod this is the
           *  run's finishedAt timestamp. */}
          <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/40">
            Today, 11:43am
          </div>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2.5 text-[12px] text-white/60">
          <span className="ppcio-live-dot inline-block h-2 w-2 rounded-full bg-ppc-purple-500" />
          <span className="font-medium uppercase tracking-wider">Running</span>
          <span className="opacity-40">·</span>
          <span>Stage {run.stage.current} of {run.stage.total}</span>
        </div>
      )}
    </div>
  );
}

// ─── Hero (shared headline + description block) ──────────────────────────
function Hero({ headline, description }: { headline: string; description: string }) {
  // Pull a trailing period off so we can style it purple — the StagePage
  // signature flourish from Stewart's JSX.
  const hasPeriod = headline.endsWith('.');
  const headlineBody = hasPeriod ? headline.slice(0, -1) : headline;
  return (
    <div className="mb-12">
      <h1 className="font-display text-[64px] font-extrabold leading-[0.96] tracking-[-0.035em] text-white sm:text-[68px]">
        {headlineBody}
        {hasPeriod && <span className="text-ppc-purple-500">.</span>}
      </h1>
      <p className="mt-6 max-w-[560px] text-[18px] leading-[1.55] tracking-tight text-white/70">
        {description}
      </p>
    </div>
  );
}

// ─── RunningBody ──────────────────────────────────────────────────────────
function RunningBody({ run }: { run: AgentRun }) {
  const completed = run.completedStages ?? [];
  const upcoming = run.upcomingStages ?? [];
  return (
    <>
      <Hero headline={run.headline} description={run.description} />

      {run.activeAgent && (
        <div className="ppcio-agent-card relative mb-7 flex items-center gap-4 rounded-2xl bg-white/[0.04] p-5"
             style={{ backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))' }}>
          <Avatar initial={run.activeAgent.initial} />
          <div className="flex-1 leading-tight">
            <div className="text-[15px] font-semibold tracking-tight text-white">
              {run.activeAgent.role}
            </div>
            <div className="mt-0.5 text-[13.5px] text-white/70">{run.activeAgent.task}</div>
          </div>
          <div className="tabular text-[13px] font-medium text-white/70">
            {run.activeAgent.elapsed}
          </div>
        </div>
      )}

      {/* Progress bar */}
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

// ─── CompletedBody ────────────────────────────────────────────────────────
function CompletedBody({ run }: { run: AgentRun }) {
  const [showData, setShowData] = useState(false);
  const totalToolCalls = (run.dataSources ?? []).reduce((s, x) => s + (x.toolCallCount || 0), 0);
  const sourceCount = (run.dataSources ?? []).length;
  const previewTools = (run.dataSources ?? []).flatMap((s) => s.tools || []);
  const remainingTools = previewTools.length - 4;

  return (
    <>
      <Hero headline={run.headline} description={run.description} />

      {run.stats && run.stats.length > 0 && (
        <div
          className="mb-12 grid gap-3"
          style={{ gridTemplateColumns: `repeat(${run.stats.length}, 1fr)` }}
        >
          {run.stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      )}

      {run.findings && run.findings.length > 0 && (
        <div className="mb-7">
          <SectionLabel>What the team found</SectionLabel>
          <div className="flex flex-col gap-[14px]">
            {run.findings.map((f, i) => <FindingItem key={i} {...f} />)}
          </div>
        </div>
      )}

      {/* Audit the work — the receipts reveal. */}
      {run.dataSources && run.dataSources.length > 0 && (
        <div className="mb-10">
          <button
            onClick={() => setShowData(!showData)}
            className="relative w-full overflow-hidden rounded-2xl border border-ppc-purple-500/25 px-7 pb-6 pt-7 text-left transition-all"
            style={{
              backgroundImage: showData
                ? 'linear-gradient(135deg, rgba(128,87,255,0.10) 0%, rgba(128,87,255,0.03) 60%, rgba(255,255,255,0.025) 100%)'
                : 'linear-gradient(135deg, rgba(128,87,255,0.07) 0%, rgba(128,87,255,0.02) 60%, rgba(255,255,255,0.02) 100%)',
            }}
          >
            <span className="pointer-events-none absolute left-6 right-6 top-0 h-px bg-grad-sheen" />
            <div className="mb-3 flex items-start justify-between gap-5">
              <div className="text-[22px] font-bold leading-[1.1] tracking-tight text-white">
                Audit the work
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition-all ${
                showData
                  ? 'border-white/10 bg-white/5 text-white/70'
                  : 'border-ppc-purple-500/30 bg-ppc-purple-500/15 text-ppc-purple-300'
              }`}>
                {showData ? 'Close' : 'Reveal'}
                <CaretDown size={14} weight="bold" className={`transition-transform ${showData ? 'rotate-180' : ''}`} />
              </span>
            </div>
            <p className="mb-5 max-w-[540px] text-[15px] leading-[1.55] tracking-tight text-white/70">
              Every API call, every data point, every AI judgment.{' '}
              <span className="font-medium text-white tabular">
                {totalToolCalls} tool invocations across {sourceCount} specialists.
              </span>{' '}
              Inspect the methodology, audit the source tables, export the raw data.
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {previewTools.slice(0, 4).map((t, i) => <ToolPill key={i}>{t}</ToolPill>)}
              {remainingTools > 0 && (
                <span className="ml-1 text-[12.5px] font-medium tracking-tight text-white/70">
                  + {remainingTools} more tools
                </span>
              )}
            </div>
          </button>

          {showData && (
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.015] px-6 pb-4 pt-8">
              {run.dataSources.map((s, i) => (
                <DataSourceBlock key={i} {...s} isLast={i === run.dataSources!.length - 1} />
              ))}
            </div>
          )}
        </div>
      )}

      {run.actions && run.actions.length > 0 && (
        <div className="flex flex-wrap gap-2.5 border-t border-white/8 pt-7">
          {run.actions.map((a, i) => <ActionButton key={i} {...a} />)}
        </div>
      )}
    </>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────

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

function StatCard({ value, label }: StatTile) {
  return (
    <div
      className="rounded-2xl border border-white/8 p-5"
      style={{
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
      }}
    >
      <div className="tabular text-[44px] font-bold leading-none tracking-[-0.035em] text-white">
        {value}
      </div>
      <div className="mt-2.5 text-[13.5px] leading-snug tracking-tight text-white/70">{label}</div>
    </div>
  );
}

function FindingItem({ agent, finding, priority, impact, action }: Finding) {
  const priorityColor = {
    high:   { bg: 'rgba(228, 90, 67, 0.12)',  border: 'rgba(228, 90, 67, 0.28)',  fg: '#FF8B6E' },
    medium: { bg: 'rgba(128, 87, 255, 0.12)', border: 'rgba(128, 87, 255, 0.28)', fg: '#A88CFF' },
    low:    { bg: 'rgba(255,255,255,0.04)',   border: 'rgba(255,255,255,0.10)',   fg: '#80809C' },
  }[priority];

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.02] px-5 pb-4 pt-5">
      <span
        className="w-1 shrink-0 self-stretch rounded-sm opacity-65"
        style={{ backgroundImage: 'linear-gradient(180deg, #8057FF 0%, #A88CFF 100%)' }}
      />
      <div className="flex-1 leading-relaxed">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-ppc-purple-300">
            {agent}
          </div>
          {priority && (
            <div
              className="rounded border px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-wider"
              style={{ background: priorityColor.bg, borderColor: priorityColor.border, color: priorityColor.fg }}
            >
              {priority} priority
            </div>
          )}
        </div>
        <div className="text-[15.5px] leading-[1.5] tracking-tight text-white">{finding}</div>
        {(impact || action) && (
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-3">
            {impact && (
              <div className="inline-flex items-center gap-1.5 text-[13px] font-medium tracking-tight text-white/70">
                <span className="text-[14px] text-ppc-success">↑</span>
                <span className="text-white">{impact}</span>
              </div>
            )}
            {action && (
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-ppc-purple-500/25 px-3 py-1.5 text-[12.5px] font-semibold tracking-tight text-ppc-purple-300 transition-all hover:bg-ppc-purple-500/10">
                {action} <ArrowRight size={12} weight="bold" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DataSourceBlock(props: DataSource & { isLast: boolean }) {
  const { agent, tools, toolCallCount, dataPointsLabel, summary, dataPreview, isLast } = props;
  return (
    <div className={isLast ? '' : 'mb-8 border-b border-white/8 pb-8'}>
      <div className="mb-4">
        <div className="text-[16px] font-semibold tracking-tight text-white">{agent}</div>
        <div className="tabular mt-1 text-[13px] text-white/70">
          {toolCallCount} {toolCallCount === 1 ? 'tool call' : 'tool calls'} · {dataPointsLabel}
        </div>
      </div>
      {tools && tools.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {tools.map((t, i) => <ToolPill key={i}>{t}</ToolPill>)}
        </div>
      )}
      {summary && (
        <p className="mb-4 max-w-[620px] text-[14.5px] leading-relaxed tracking-tight text-white/70">
          {summary}
        </p>
      )}
      {dataPreview && <DataPreviewBlock {...dataPreview} />}
    </div>
  );
}

function ToolPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-ppc-purple-500/20 bg-ppc-purple-500/10 px-2.5 py-1 font-mono text-[12px] tracking-tight text-ppc-purple-300">
      {children}
    </span>
  );
}

function DataPreviewBlock({ headers, rows, moreCount, moreLabel }: DataPreviewTable) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-black/20 px-4 py-3.5">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="whitespace-nowrap border-b border-white/8 pb-2.5 pr-3 text-left text-[11px] font-medium uppercase tracking-wider text-white/45"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`tabular py-3 pr-3 text-[13.5px] tracking-tight ${
                    j === 0 ? 'font-medium text-white' : 'text-white/70'
                  } ${i === rows.length - 1 && !moreCount ? '' : 'border-b border-white/8'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {moreCount ? (
        <div className="tabular flex items-center justify-between pt-3 text-[13px] text-white/70">
          <span>+ {moreCount.toLocaleString()} more {moreLabel || 'rows'}</span>
          <button className="font-semibold text-ppc-purple-300 hover:underline">
            View all →
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ActionButton({ label, primary }: ActionBtn) {
  if (primary) {
    return (
      <button className="inline-flex items-center gap-2 rounded-xl bg-ppc-purple-500 px-4.5 py-3 text-[14px] font-semibold tracking-tight text-white shadow-[0_6px_18px_-4px_rgba(128,87,255,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] transition-transform hover:-translate-y-[1px]">
        {label}
        <ArrowRight size={15} weight="bold" />
      </button>
    );
  }
  return (
    <button className="inline-flex items-center rounded-xl border border-white/15 px-4 py-3 text-[14px] font-semibold tracking-tight text-white transition-colors hover:bg-white/5">
      {label}
    </button>
  );
}
