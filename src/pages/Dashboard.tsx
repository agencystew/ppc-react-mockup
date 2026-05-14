import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Clock, Sparkle, TrendUp, CheckCircle,
} from '@phosphor-icons/react';
import { AGENTS } from '../mock/agents';
import { RECENT_RUNS_SUMMARY } from '../mock/runs';

// Dashboard · /
//
// Three moments. That's it.
//
//   1. Dark hero — today's standout finding (the moment most worth seeing
//      when the user opens the app).
//   2. Activity stream — every recent run, status-tagged (running / done).
//      Merged so the user has one place to scan, not five lists.
//   3. Suggested next — three plays for this week, slim wide rows.
//
// Per Stewart 2026-05-14: "Sharpen, don't rebuild. Strip to 3 sections max."
// Cuts: KPI strip, jump strip, calls-to-make slab, client roll, featured
// run preview, multi-list duplication. The Reports and Projects pages own
// those surfaces.

const TODAY = 'Thursday · 14 May';

// Live runs (mock — in prod from the agent_runs API). Stage strings come
// straight from the StagePage running fixture so muscle-memory is preserved.
const LIVE_RUNS = [
  {
    runId: 'run-competitor-spy-running',
    agentName: 'Competitor Spy',
    projectName: 'Smith Law Group',
    stage: 'Sizing their spend · Stage 5 of 11',
    elapsed: '11m 21s',
  },
  {
    runId: 'run-weekly-audit',
    agentName: 'Weekly Audit',
    projectName: 'Northstar Dental',
    stage: 'Walking the alignment chain · Stage 3 of 7',
    elapsed: '4m 02s',
  },
];

export function Dashboard() {
  const featured = RECENT_RUNS_SUMMARY[0]; // The standout finding
  const suggested = [
    AGENTS.find((a) => a.slug === 'weekly-audit')!,
    AGENTS.find((a) => a.slug === 'spend-leak')!,
    AGENTS.find((a) => a.slug === 'sales-intelligence')!,
  ];

  return (
    <div className="space-y-14">
      {/* ═══ 1 · HERO ════════════════════════════════════════════════════
          Dark editorial MOMENT, not a wall. Compact rounded card so the
          light page bg dominates the surface area below. Today's standout
          finding + open-the-report CTA. */}
      <section className="ppc-dark ppc-dark--hero relative overflow-hidden rounded-3xl px-8 py-8 sm:px-10 sm:py-10">
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
            <span>{TODAY}</span>
            <span className="inline-flex items-center gap-2 text-white/70">
              <span className="ppcio-live-dot inline-block h-1.5 w-1.5 rounded-full bg-ppc-purple-500" />
              <span>{LIVE_RUNS.length} agents running</span>
            </span>
          </div>

          <div className="mt-5 inline-flex items-center gap-2 rounded-pill border border-ppc-purple-500/30 bg-ppc-purple-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ppc-purple-300">
            <span className="inline-block h-1 w-1 rounded-full bg-ppc-purple-500" />
            Today's headline finding
          </div>

          <h1 className="mt-3 max-w-[760px] font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.028em] text-white sm:text-[48px]">
            {featured.headline}<span className="text-ppc-purple-500">.</span>
          </h1>
          <p className="mt-4 max-w-[560px] text-[15px] leading-[1.55] tracking-tight text-white/65">
            {featured.agentName} on {featured.projectName} · finished {featured.finishedAt}.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Link
              to={`/reports/${featured.runId}`}
              className="inline-flex items-center gap-2 rounded-md bg-ppc-purple-500 px-4 py-2.5 text-[13.5px] font-semibold tracking-tight text-white shadow-[0_4px_14px_-4px_rgba(128,87,255,0.55)] transition-transform hover:-translate-y-[1px]"
            >
              <Sparkle size={13} weight="fill" />
              Open the report
              <ArrowRight size={12} weight="bold" />
            </Link>
            <Link
              to="/agents"
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3.5 py-2.5 text-[13.5px] font-semibold tracking-tight text-white/85 transition-colors hover:bg-white/5"
            >
              Run another agent <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 2 · ACTIVITY STREAM ════════════════════════════════════════
          One list. Live runs first, finished runs after. Same row shape so
          the eye scans cleanly. No double sections. */}
      <section>
        <SectionEyebrow
          label="Activity"
          count={LIVE_RUNS.length + RECENT_RUNS_SUMMARY.length}
          action={
            <Link to="/runs" className="ppc-link inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500">
              Mission control <ArrowRight size={12} weight="bold" />
            </Link>
          }
        />
        <ul className="divide-y divide-ppc-neutral-100 overflow-hidden rounded-2xl border border-ppc-neutral-100 bg-white">
          {LIVE_RUNS.map((r) => (
            <LiveRow key={r.runId} {...r} />
          ))}
          {RECENT_RUNS_SUMMARY.map((r) => (
            <FinishedRow key={r.runId} {...r} />
          ))}
        </ul>
      </section>

      {/* ═══ 3 · SUGGESTED NEXT ═════════════════════════════════════════
          Three plays for this week. Slim wide rows so the picker doesn't
          fight with the activity stream for attention. */}
      <section>
        <SectionEyebrow
          label="Worth running next"
          count={suggested.length}
          action={
            <Link to="/agents" className="ppc-link inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500">
              All agents <ArrowRight size={12} weight="bold" />
            </Link>
          }
        />
        <ul className="divide-y divide-ppc-neutral-100 overflow-hidden rounded-2xl border border-ppc-neutral-100 bg-white">
          {suggested.map((a) => (
            <li key={a.slug}>
              <Link
                to={`/agents/${a.slug}`}
                className="group flex items-center gap-5 px-7 py-5 transition-colors hover:bg-ppc-purple-50/40"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ppc-purple-50 text-[20px]">
                  {a.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-bold tracking-tight text-ppc-black">
                    {a.name}
                  </div>
                  <div className="mt-0.5 max-w-[560px] truncate text-[13.5px] text-ppc-neutral-600">
                    {a.headline}
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ppc-neutral-500">
                    <Clock size={11} weight="duotone" />
                    <span className="tabular">{a.expectedDuration}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500 transition-[gap] group-hover:gap-2">
                  Launch <ArrowRight size={12} weight="bold" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ─── Section eyebrow with optional count chip + action link ─────────────
function SectionEyebrow({
  label, count, action,
}: {
  label: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ppc-neutral-500">
        <span>{label}</span>
        {count !== undefined && (
          <span className="tabular rounded-md bg-ppc-neutral-100 px-1.5 py-0.5 text-[10.5px] text-ppc-neutral-600">
            {String(count).padStart(2, '0')}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Row primitives ─────────────────────────────────────────────────────

function LiveRow({
  runId, agentName, projectName, stage, elapsed,
}: typeof LIVE_RUNS[number]) {
  return (
    <li>
      <Link
        to={`/agents/competitor-spy/run/${runId}`}
        className="group flex items-center gap-5 px-7 py-5 transition-colors hover:bg-ppc-purple-50/40"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ppc-purple-50">
          <span className="ppcio-live-dot inline-block h-2 w-2 rounded-full bg-ppc-purple-500" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-mono font-semibold uppercase tracking-[0.08em] text-ppc-purple-500">
              Running · {agentName}
            </span>
            <span className="text-ppc-neutral-300">·</span>
            <span className="text-ppc-neutral-500">{projectName}</span>
          </div>
          <div className="mt-1 truncate text-[14.5px] font-medium tracking-tight text-ppc-black">
            {stage}
          </div>
        </div>
        <span className="tabular hidden text-[12.5px] font-medium text-ppc-neutral-500 sm:block">
          {elapsed}
        </span>
        <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500 transition-[gap] group-hover:gap-2">
          Watch <ArrowUpRight size={12} weight="bold" />
        </span>
      </Link>
    </li>
  );
}

function FinishedRow({
  runId, agentName, projectName, headline, finishedAt, duration, upside,
}: typeof RECENT_RUNS_SUMMARY[number]) {
  return (
    <li>
      <Link
        to={`/reports/${runId}`}
        className="group flex items-center gap-5 px-7 py-5 transition-colors hover:bg-ppc-purple-50/40"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ppc-success/15 text-ppc-success">
          <CheckCircle size={14} weight="fill" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-mono font-semibold uppercase tracking-[0.08em] text-ppc-purple-500">
              {agentName}
            </span>
            <span className="text-ppc-neutral-300">·</span>
            <span className="text-ppc-neutral-500">{projectName}</span>
            <span className="text-ppc-neutral-300">·</span>
            <span className="tabular text-ppc-neutral-500">{finishedAt}</span>
          </div>
          <div className="mt-1 truncate text-[15px] font-semibold tracking-tight text-ppc-black">
            {headline}
          </div>
        </div>
        <div className="hidden items-center gap-4 text-[12.5px] sm:flex">
          <span className="inline-flex items-center gap-1 text-ppc-neutral-500">
            <Clock size={11} weight="duotone" />
            <span className="tabular">{duration}</span>
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-ppc-success">
            <TrendUp size={12} weight="bold" />
            <span className="tabular">{upside}</span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500 transition-[gap] group-hover:gap-2">
          Report <ArrowUpRight size={12} weight="bold" />
        </span>
      </Link>
    </li>
  );
}
