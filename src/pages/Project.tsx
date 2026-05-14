import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Clock, Sparkle, FileText, TrendUp, TrendDown,
  Minus, ArrowUpRight, CheckCircle,
} from '@phosphor-icons/react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';
import { RECENT_RUNS_SUMMARY } from '../mock/runs';

// Project page · /projects/:id
//
// Three moments. That's it.
//
//   1. Dark hero — client name + this-week-at-a-glance (3 vital signs).
//   2. Accounts & campaigns — one combined editorial list.
//   3. What's been on this client's desk — recent runs.
//
// Per Stewart 2026-05-14: "Project dossier was a kitchen sink. Sharpen."
// Cuts: separate accounts table, separate campaigns table, business-context
// paragraph (moves to a drawer/edit page), "Three plays for this client"
// tile-grid (Dashboard already does this surface), redundant status pills.

// ─── Account-level spend signal (mock; in prod from API) ────────────────
const ACCOUNT_METRICS: Record<string, { spend30d: string; trendPct: number; campaigns: number }> = {
  a1:  { spend30d: '$74,200', trendPct: 12,  campaigns: 6 },
  a2:  { spend30d: '$98,400', trendPct: 8,   campaigns: 8 },
  a3:  { spend30d: '$42,100', trendPct: -4,  campaigns: 3 },
  a4:  { spend30d: '$58,300', trendPct: 14,  campaigns: 5 },
  a5:  { spend30d: '$31,800', trendPct: 9,   campaigns: 4 },
  a6:  { spend30d: '$22,900', trendPct: -2,  campaigns: 3 },
  a7:  { spend30d: '$68,500', trendPct: 18,  campaigns: 6 },
  a8:  { spend30d: '$41,200', trendPct: 22,  campaigns: 4 },
  a9:  { spend30d: '$54,700', trendPct: -7,  campaigns: 5 },
  a10: { spend30d: '$28,400', trendPct: 6,   campaigns: 3 },
  a11: { spend30d: '$36,800', trendPct: 4,   campaigns: 4 },
};

export function ProjectPage() {
  const { id } = useParams();
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) return <Navigate to="/projects" replace />;

  const accounts = ACCOUNTS.filter((a) => a.projectId === project.id);
  const recentRuns = RECENT_RUNS_SUMMARY.filter((r) => r.projectName === project.name);

  return (
    <div className="space-y-12">
      {/* Back rail */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ppc-neutral-500 transition-colors hover:text-ppc-purple-500"
      >
        <ArrowLeft size={12} weight="bold" /> All clients
      </Link>

      {/* ═══ 1 · HERO ═══════════════════════════════════════════════════
          Dark editorial moment with client name + 3 vital signs. Compact,
          not a wall — light body wins surface area below. */}
      <section className="ppc-dark ppc-dark--hero relative overflow-hidden rounded-3xl px-8 py-9 sm:px-10 sm:py-10">
        <div className="relative">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
            {project.industry} · {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
          </div>

          <h1 className="mt-3 font-display text-[44px] font-extrabold leading-[1.02] tracking-[-0.028em] text-white sm:text-[52px]">
            {project.name}<span className="text-ppc-purple-500">.</span>
          </h1>

          <div className="mt-7 grid gap-x-10 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-3">
            <VitalSign eyebrow="Surfaced this week" value="$20.2K" sub="of upside" />
            <VitalSign eyebrow="Time saved"         value="~9h"    sub="analyst-equivalent" />
            <VitalSign eyebrow="Active campaigns"   value="14"     sub="across accounts" />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <Link
              to="/agents"
              className="inline-flex items-center gap-2 rounded-md bg-ppc-purple-500 px-4 py-2.5 text-[13.5px] font-semibold tracking-tight text-white shadow-[0_4px_14px_-4px_rgba(128,87,255,0.55)] transition-transform hover:-translate-y-[1px]"
            >
              <Sparkle size={13} weight="fill" />
              Run an agent
              <ArrowRight size={12} weight="bold" />
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3.5 py-2.5 text-[13.5px] font-semibold tracking-tight text-white/85 transition-colors hover:bg-white/5"
            >
              <FileText size={13} weight="duotone" /> Generate client report
            </button>
          </div>
        </div>
      </section>

      {/* ═══ 2 · ACCOUNTS & CAMPAIGNS ═══════════════════════════════════
          One combined editorial block. Each row carries the account name,
          customer ID, campaign count, 30-day spend, trend, health dot. */}
      <section>
        <SectionEyebrow label="Accounts & campaigns" count={accounts.length} />
        <ul className="divide-y divide-ppc-neutral-100 overflow-hidden rounded-2xl border border-ppc-neutral-100 bg-white">
          {accounts.map((acc) => {
            const m = ACCOUNT_METRICS[acc.id] ?? { spend30d: '—', trendPct: 0, campaigns: 0 };
            return (
              <li key={acc.id}>
                <button
                  type="button"
                  className="group flex w-full items-center gap-6 px-7 py-5 text-left transition-colors hover:bg-ppc-purple-50/40"
                >
                  <HealthDot tone={acc.health} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15.5px] font-semibold tracking-tight text-ppc-black">
                      {acc.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 font-mono text-[11px] text-ppc-neutral-500">
                      <span className="tabular">{acc.customerId}</span>
                      <span className="text-ppc-neutral-300">·</span>
                      <span className="tabular">{m.campaigns} campaigns</span>
                    </div>
                  </div>
                  <div className="hidden text-right md:block">
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ppc-neutral-400">
                      30d spend
                    </div>
                    <div className="tabular mt-0.5 text-[14.5px] font-semibold text-ppc-black">
                      {m.spend30d}
                    </div>
                  </div>
                  <div className="hidden w-20 text-right md:block">
                    <TrendBadge pct={m.trendPct} />
                  </div>
                  <ArrowRight size={12} weight="bold" className="text-ppc-neutral-300 transition-colors group-hover:text-ppc-purple-500" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ═══ 3 · RECENT RUNS ════════════════════════════════════════════ */}
      <section>
        <SectionEyebrow
          label="What's been on this client's desk"
          count={recentRuns.length}
        />
        {recentRuns.length > 0 ? (
          <ul className="divide-y divide-ppc-neutral-100 overflow-hidden rounded-2xl border border-ppc-neutral-100 bg-white">
            {recentRuns.map((r) => (
              <li key={r.runId}>
                <Link
                  to={`/reports/${r.runId}`}
                  className="group flex items-center gap-5 px-7 py-5 transition-colors hover:bg-ppc-purple-50/40"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ppc-success/15 text-ppc-success">
                    <CheckCircle size={14} weight="fill" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-mono font-semibold uppercase tracking-[0.08em] text-ppc-purple-500">
                        {r.agentName}
                      </span>
                      <span className="text-ppc-neutral-300">·</span>
                      <span className="tabular text-ppc-neutral-500">{r.finishedAt}</span>
                    </div>
                    <div className="mt-1 truncate text-[15px] font-semibold tracking-tight text-ppc-black">
                      {r.headline}
                    </div>
                  </div>
                  <div className="hidden items-center gap-4 text-[12.5px] sm:flex">
                    <span className="inline-flex items-center gap-1 text-ppc-neutral-500">
                      <Clock size={11} weight="duotone" />
                      <span className="tabular">{r.duration}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-ppc-success">
                      <TrendUp size={12} weight="bold" />
                      <span className="tabular">{r.upside}</span>
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500 transition-[gap] group-hover:gap-2">
                    Report <ArrowUpRight size={12} weight="bold" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-ppc-neutral-200 bg-white px-7 py-10 text-center">
            <div className="text-[15px] font-medium text-ppc-neutral-600">
              No runs yet this week.
            </div>
            <Link
              to="/agents"
              className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-ppc-purple-500 hover:underline"
            >
              Run an agent <ArrowRight size={12} weight="bold" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Pieces ─────────────────────────────────────────────────────────────

function SectionEyebrow({ label, count }: { label: string; count?: number }) {
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
    </div>
  );
}

function VitalSign({ eyebrow, value, sub }: { eyebrow: string; value: string; sub: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
        {eyebrow}
      </div>
      <div className="tabular mt-1.5 font-display text-[32px] font-extrabold leading-none tracking-[-0.025em] text-white">
        {value}
      </div>
      <div className="mt-1 text-[12px] text-white/55">{sub}</div>
    </div>
  );
}

function HealthDot({ tone }: { tone: 'good' | 'warning' | 'attention' }) {
  const cls = {
    good:      'bg-ppc-success',
    warning:   'bg-ppc-warning',
    attention: 'bg-ppc-error',
  }[tone];
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ppc-neutral-50">
      <span className={`h-2 w-2 rounded-full ${cls}`} />
    </span>
  );
}

function TrendBadge({ pct }: { pct: number }) {
  if (pct === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ppc-neutral-500">
        <Minus size={11} weight="bold" /> flat
      </span>
    );
  }
  if (pct > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-success">
        <TrendUp size={11} weight="bold" />
        <span className="tabular">{pct}%</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-error">
      <TrendDown size={11} weight="bold" />
      <span className="tabular">{pct}%</span>
    </span>
  );
}
