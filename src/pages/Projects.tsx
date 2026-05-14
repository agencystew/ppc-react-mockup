import { Link } from 'react-router-dom';
import {
  ArrowRight, Plus, MagnifyingGlass, TrendUp, Buildings, Clock, Sparkle,
} from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';

// Projects list · /projects
//
// LIGHT workshop surface (per hybrid design system: directory pages are
// light, AI artifacts are dark). One dark hero card as the focal moment,
// then editorial rows.
//
// Three jobs:
//   1. Dark hero — roster framing + Add client / Connect MCC actions.
//   2. Search + filter.
//   3. Client rows — one per project, sortable scan by upside / activity.

const ACTIVITY: Record<string, { lastRun: string; agentsThisWeek: number; upside: string; tone: 'good' | 'warning' | 'attention' }> = {
  'smith-law':   { lastRun: '2 hours ago',  agentsThisWeek: 4, upside: '$20.2K', tone: 'good' },
  'clear-skies': { lastRun: 'Yesterday',    agentsThisWeek: 2, upside: '$4.1K',  tone: 'warning' },
  'northstar':   { lastRun: 'Yesterday',    agentsThisWeek: 5, upside: '$11.4K', tone: 'good' },
  'lemon-leaf':  { lastRun: '3 days ago',   agentsThisWeek: 3, upside: '$8.8K',  tone: 'good' },
  'rocket-pet':  { lastRun: '6 hours ago',  agentsThisWeek: 6, upside: '$3.4K',  tone: 'attention' },
  'ironclad':    { lastRun: '4 days ago',   agentsThisWeek: 1, upside: '$2.6K',  tone: 'good' },
};

export function Projects() {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return PROJECTS;
    return PROJECTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.industry ?? '').toLowerCase().includes(q),
    );
  }, [filter]);

  return (
    <div className="space-y-10">
      {/* ═══ HERO ════════════════════════════════════════════════════════
          Dark editorial moment. Same compact rhythm as Dashboard + Project
          dossier so the workshop pages all read as one product. */}
      <section className="ppc-dark ppc-dark--hero relative overflow-hidden rounded-3xl px-8 py-9 sm:px-10 sm:py-10">
        <div className="relative">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
            Your roster · {PROJECTS.length} clients · {ACCOUNTS.length} accounts
          </div>
          <h1 className="mt-3 max-w-[760px] font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.028em] text-white sm:text-[48px]">
            {PROJECTS.length} clients on the books<span className="text-ppc-purple-500">.</span>
          </h1>
          <p className="mt-4 max-w-[560px] text-[15px] leading-[1.55] tracking-tight text-white/65">
            Each one has its agents on watch. Open a client to read the full dossier — connected accounts, weekly findings, what's worth running next.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <button className="inline-flex items-center gap-2 rounded-md bg-ppc-purple-500 px-4 py-2.5 text-[13.5px] font-semibold tracking-tight text-white shadow-[0_4px_14px_-4px_rgba(128,87,255,0.55)] transition-transform hover:-translate-y-[1px]">
              <Plus size={13} weight="bold" />
              Add a client
            </button>
            <button className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3.5 py-2.5 text-[13.5px] font-semibold tracking-tight text-white/85 transition-colors hover:bg-white/5">
              <Buildings size={13} weight="duotone" /> Connect MCC
            </button>
          </div>
        </div>
      </section>

      {/* Search row */}
      <div className="flex items-center gap-3 rounded-2xl border border-ppc-neutral-100 bg-white px-5 py-3">
        <MagnifyingGlass size={15} weight="duotone" className="text-ppc-neutral-400" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Search ${PROJECTS.length} clients…`}
          className="flex-1 bg-transparent text-[14px] font-medium tracking-tight text-ppc-black outline-none placeholder:text-ppc-neutral-400"
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ppc-neutral-400">
          {String(filtered.length).padStart(2, '0')} of {String(PROJECTS.length).padStart(2, '0')}
        </span>
      </div>

      {/* Client rows */}
      <ul className="divide-y divide-ppc-neutral-100 overflow-hidden rounded-2xl border border-ppc-neutral-100 bg-white">
        {filtered.map((p) => {
          const a = ACTIVITY[p.id] ?? { lastRun: '—', agentsThisWeek: 0, upside: '—', tone: 'good' as const };
          return (
            <li key={p.id}>
              <Link
                to={`/projects/${p.id}`}
                className="group flex items-center gap-6 px-7 py-5 transition-colors hover:bg-ppc-purple-50/40"
              >
                <HealthDot tone={a.tone} />
                <div className="min-w-0 flex-1">
                  <div className="text-[16.5px] font-semibold tracking-tight text-ppc-black">
                    {p.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[12.5px] text-ppc-neutral-500">
                    <span>{p.industry}</span>
                    <span className="text-ppc-neutral-300">·</span>
                    <span className="tabular">
                      {p.accountCount} {p.accountCount === 1 ? 'account' : 'accounts'}
                    </span>
                  </div>
                </div>

                <div className="hidden text-right md:block">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ppc-neutral-400">
                    Upside this week
                  </div>
                  <div className="tabular mt-0.5 inline-flex items-center gap-1 text-[14.5px] font-semibold text-ppc-success">
                    <TrendUp size={12} weight="bold" />
                    {a.upside}
                  </div>
                </div>

                <div className="hidden w-20 text-right md:block">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ppc-neutral-400">
                    Agents
                  </div>
                  <div className="tabular mt-0.5 text-[14.5px] font-semibold text-ppc-black">
                    {a.agentsThisWeek}
                  </div>
                </div>

                <div className="hidden w-24 text-right lg:block">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ppc-neutral-400">
                    Last run
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-ppc-neutral-700">
                    <Clock size={10} weight="duotone" className="text-ppc-neutral-400" />
                    {a.lastRun}
                  </div>
                </div>

                <ArrowRight
                  size={13}
                  weight="bold"
                  className="text-ppc-neutral-300 transition-colors group-hover:text-ppc-purple-500"
                />
              </Link>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-7 py-12 text-center text-[14px] text-ppc-neutral-500">
            No clients match "{filter}".
          </li>
        )}
      </ul>

      <p className="text-[12.5px] text-ppc-neutral-500">
        Tip: open any client to see their dossier, connected accounts, and the agent runs that landed this week.
      </p>
    </div>
  );
}

function HealthDot({ tone }: { tone: 'good' | 'warning' | 'attention' }) {
  const map = {
    good:      { dot: 'bg-ppc-success', label: 'On track' },
    warning:   { dot: 'bg-ppc-warning', label: 'Watch' },
    attention: { dot: 'bg-ppc-error',   label: 'Needs eyes' },
  }[tone];
  return (
    <span className="hidden shrink-0 items-center gap-1.5 rounded-pill border border-ppc-neutral-100 bg-ppc-neutral-25 px-2.5 py-1 text-[11px] font-medium text-ppc-neutral-700 sm:inline-flex">
      <span className={`h-1.5 w-1.5 rounded-full ${map.dot}`} />
      {map.label}
    </span>
  );
}

// Sparkle import kept for future "Run an agent" CTA usage on this page.
void Sparkle;
