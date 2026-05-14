import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, ArrowUpRight, Sparkle, ArrowRight,
} from '@phosphor-icons/react';
import { AGENTS, CATEGORIES } from '../mock/agents';
import type { AgentCategory, AgentDefinition } from '../types/agent';

// Agent Catalog · /agents
//
// LIGHT workshop with ONE dark focal moment (the hero card).
//
// Three jobs:
//   1. Dark hero — the headline + library framing.
//   2. Filter pills — capsule tabs with count chips.
//   3. Agent grid — 2-column light cards, grouped by category when on All.
//
// Pre-run surface: NO specific $ figures (per feedback_no_pre_run_dollar_figures).

type FilterKey = 'all' | AgentCategory;

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all',         label: 'All agents' },
  { key: 'operations',  label: 'Operations' },
  { key: 'creative',    label: 'Creative' },
  { key: 'strategic',   label: 'Strategic' },
  { key: 'buyer',       label: 'Buyer' },
  { key: 'diagnostics', label: 'Diagnostics' },
  { key: 'client',      label: 'Client' },
  { key: 'context',     label: 'Context' },
];

const CATEGORY_ORDER: AgentCategory[] = [
  'operations', 'strategic', 'creative', 'buyer', 'diagnostics', 'client', 'context',
];

export function AgentCatalog() {
  const [active, setActive] = useState<FilterKey>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: AGENTS.length };
    AGENTS.forEach((a) => { c[a.category] = (c[a.category] || 0) + 1; });
    return c;
  }, []);

  const visible = active === 'all' ? AGENTS : AGENTS.filter((a) => a.category === active);

  return (
    <div className="space-y-10">
      {/* ═══ 1 · HERO — dark focal moment ════════════════════════════════ */}
      <section className="ppc-dark ppc-dark--hero relative overflow-hidden rounded-3xl px-8 py-9 sm:px-10 sm:py-10">
        <div className="relative">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
            The agent library · {AGENTS.length} specialists
          </div>
          <h1 className="mt-3 max-w-[760px] font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.028em] text-white sm:text-[48px]">
            Agents that actually understand Google Ads<span className="text-ppc-purple-500">.</span>
          </h1>
          <p className="mt-4 max-w-[560px] text-[15px] leading-[1.55] tracking-tight text-white/65">
            Twenty-eight specialists, one team. They read your accounts the way a senior strategist would. Pick one to run now, or stack a week of work to run while you sleep.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <button className="inline-flex items-center gap-2 rounded-md bg-ppc-purple-500 px-4 py-2.5 text-[13.5px] font-semibold tracking-tight text-white shadow-[0_4px_14px_-4px_rgba(128,87,255,0.55)] transition-transform hover:-translate-y-[1px]">
              <Sparkle size={13} weight="fill" />
              Schedule a stack
            </button>
            <button className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3.5 py-2.5 text-[13.5px] font-semibold tracking-tight text-white/85 transition-colors hover:bg-white/5">
              How agents think <ArrowRight size={12} weight="bold" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ 2 · FILTER PILLS ═══════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const isActive = active === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className={`inline-flex items-center gap-2 rounded-pill border px-4 py-1.5 text-[13px] font-semibold tracking-tight transition-colors ${
                isActive
                  ? 'border-ppc-purple-500 bg-ppc-purple-500 text-white'
                  : 'border-ppc-neutral-100 bg-white text-ppc-neutral-700 hover:border-ppc-purple-300 hover:text-ppc-black'
              }`}
            >
              {f.label}
              <span
                className={`tabular rounded-md px-1.5 py-0.5 text-[10.5px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-ppc-neutral-50 text-ppc-neutral-500'
                }`}
              >
                {String(counts[f.key] ?? 0).padStart(2, '0')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active category lede */}
      {active !== 'all' && (
        <p className="-mt-4 text-[14.5px] tracking-tight text-ppc-neutral-600">
          <span className="font-semibold text-ppc-black">{CATEGORIES[active]?.label}.</span>{' '}
          {CATEGORIES[active]?.description}
        </p>
      )}

      {/* ═══ 3 · GRID ════════════════════════════════════════════════════ */}
      {active === 'all' ? (
        <div className="space-y-12">
          {CATEGORY_ORDER.map((cat, i) => {
            const inCat = AGENTS.filter((a) => a.category === cat);
            if (inCat.length === 0) return null;
            return (
              <section key={cat}>
                <SectionHead
                  index={i + 1}
                  label={CATEGORIES[cat]?.label ?? cat}
                  description={CATEGORIES[cat]?.description ?? ''}
                  count={inCat.length}
                />
                <div className="grid gap-4 lg:grid-cols-2">
                  {inCat.map((a) => <AgentCard key={a.slug} agent={a} />)}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((a) => <AgentCard key={a.slug} agent={a} />)}
        </div>
      )}
    </div>
  );
}

// ─── Section head ───────────────────────────────────────────────────────

function SectionHead({
  index, label, description, count,
}: {
  index: number;
  label: string;
  description: string;
  count: number;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-ppc-neutral-100 pb-3">
      <div className="flex items-baseline gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ppc-neutral-500">
        <span className="tabular text-ppc-purple-500">{String(index).padStart(2, '0')}</span>
        <span className="text-ppc-black">{label}</span>
        <span className="text-ppc-neutral-300">·</span>
        <span className="text-ppc-neutral-500 normal-case tracking-tight">{description}</span>
      </div>
      <span className="tabular font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ppc-neutral-400">
        {String(count).padStart(2, '0')} {count === 1 ? 'agent' : 'agents'}
      </span>
    </div>
  );
}

// ─── Agent card ─────────────────────────────────────────────────────────

function AgentCard({ agent: a }: { agent: AgentDefinition }) {
  const hasPeriod = a.headline.endsWith('.');
  const headlineBody = hasPeriod ? a.headline.slice(0, -1) : a.headline;
  return (
    <Link
      to={`/agents/${a.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-ppc-neutral-100 bg-white p-7 transition-all hover:-translate-y-[1px] hover:border-ppc-purple-300 hover:shadow-ppc-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl bg-ppc-purple-50 text-[22px]"
          aria-hidden
        >
          {a.emoji}
        </span>
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ppc-neutral-400">
          {a.name}
        </span>
      </div>

      <h3 className="mt-6 font-display text-[24px] font-bold leading-[1.1] tracking-[-0.02em] text-ppc-black">
        {headlineBody}
        {hasPeriod && <span className="text-ppc-purple-500">.</span>}
      </h3>

      <p className="mt-3 text-[14px] leading-[1.55] tracking-tight text-ppc-neutral-600">
        {a.outcomeDescription}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-ppc-neutral-100 pt-4 text-[12.5px]">
        <span className="inline-flex items-center gap-1.5 font-medium text-ppc-neutral-500">
          <Clock size={12} weight="duotone" />
          <span className="tabular">{a.expectedDuration}</span>
          <span className="text-ppc-neutral-400">· background</span>
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-ppc-purple-500 transition-[gap] group-hover:gap-2">
          Open <ArrowUpRight size={12} weight="bold" />
        </span>
      </div>
    </Link>
  );
}
