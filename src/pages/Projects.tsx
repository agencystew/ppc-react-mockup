import { Link } from 'react-router-dom';
import {
  ArrowRight, Plus, MagnifyingGlass, TrendUp, Buildings, Clock,
} from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { PROJECTS, ACCOUNTS } from '../mock/projects';
import { PageHero, PrimaryCTA, SecondaryButton } from '../components/PageHero';

// Projects · /projects
//
// The agency-team home for managing clients on the dark canvas. Lists
// every project (client) the team is running with at-a-glance health,
// account count, and the most recent agent activity. Click → /projects/:id
// for the dossier.
//
// Per Stewart 2026-05-14: "/projects is meant to be the LIST of projects."

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
  const totalAccounts = ACCOUNTS.length;

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
    <div className="space-y-12">
      <PageHero
        eyebrow={`Clients · ${PROJECTS.length} projects · ${totalAccounts} Google Ads accounts`}
        headline={`${PROJECTS.length} clients on your roster.`}
        description="Every project below has its agents on watch. Open one to see the full dossier, recent runs, and what's worth running next."
        actions={
          <>
            <PrimaryCTA>
              <Plus size={16} weight="bold" />
              Add a client
            </PrimaryCTA>
            <SecondaryButton>
              <Buildings size={16} weight="duotone" />
              Connect MCC
            </SecondaryButton>
          </>
        }
      />

      {/* Search row */}
      <div className="flex items-center gap-3 border-y border-white/8 py-4">
        <MagnifyingGlass size={16} weight="duotone" className="text-white/45" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Search ${PROJECTS.length} clients...`}
          className="flex-1 bg-transparent text-[15px] font-medium tracking-tight text-white outline-none placeholder:text-white/40"
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/45">
          {filtered.length} of {PROJECTS.length}
        </span>
      </div>

      {/* Editorial rows */}
      <ul className="divide-y divide-white/8 rounded-2xl border border-white/8 bg-white/[0.04]">
        {filtered.map((p) => {
          const a = ACTIVITY[p.id] ?? { lastRun: '—', agentsThisWeek: 0, upside: '—', tone: 'good' as const };
          return (
            <li key={p.id}>
              <Link
                to={`/projects/${p.id}`}
                className="group flex items-center gap-6 px-8 py-6 transition-colors hover:bg-white/[0.04]"
              >
                {/* Identity */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="text-[18px] font-semibold tracking-tight text-white">
                      {p.name}
                    </div>
                    <HealthDot tone={a.tone} />
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[12.5px] text-white/55">
                    <span>{p.industry}</span>
                    <span className="text-white/30">·</span>
                    <span className="tabular">
                      {p.accountCount} {p.accountCount === 1 ? 'account' : 'accounts'}
                    </span>
                  </div>
                </div>

                {/* This week */}
                <div className="hidden text-right md:block">
                  <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/45">
                    Upside this week
                  </div>
                  <div className="tabular mt-1 inline-flex items-center gap-1 text-[15px] font-semibold text-ppc-success">
                    <TrendUp size={13} weight="bold" />
                    {a.upside}
                  </div>
                </div>

                {/* Activity */}
                <div className="hidden text-right md:block">
                  <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/45">
                    Agents this week
                  </div>
                  <div className="tabular mt-1 text-[15px] font-semibold text-white">
                    {a.agentsThisWeek}
                  </div>
                </div>

                {/* Last run */}
                <div className="hidden text-right lg:block">
                  <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white/45">
                    Last run
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-white/70">
                    <Clock size={11} weight="duotone" className="text-white/45" />
                    {a.lastRun}
                  </div>
                </div>

                <ArrowRight
                  size={14}
                  weight="bold"
                  className="text-white/30 transition-colors group-hover:text-ppc-purple-300"
                />
              </Link>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-8 py-12 text-center text-[14px] text-white/55">
            No clients match "{filter}".
          </li>
        )}
      </ul>

      <p className="text-[13px] text-white/55">
        Tip: open any client to see their dossier, connected accounts, and the agent runs that landed this week.
      </p>
    </div>
  );
}

function HealthDot({ tone }: { tone: 'good' | 'warning' | 'attention' }) {
  const cls = {
    good:      { dot: 'bg-ppc-success', label: 'On track' },
    warning:   { dot: 'bg-ppc-warning', label: 'Watch' },
    attention: { dot: 'bg-ppc-error',   label: 'Needs attention' },
  }[tone];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-white/70">
      <span className={`h-1.5 w-1.5 rounded-full ${cls.dot}`} />
      {cls.label}
    </span>
  );
}
