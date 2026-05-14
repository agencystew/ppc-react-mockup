import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowUpRight, Sparkle } from '@phosphor-icons/react';
import { AGENTS, CATEGORIES } from '../mock/agents';
import type { AgentCategory } from '../types/agent';
import { PageHero, PrimaryCTA, SecondaryButton } from '../components/PageHero';

// Agent Catalog · /agents
//
// Editorial rhythm:
//   - Dark hero with serif-italic gradient on accent word ("actually")
//   - Pill tabs by category (mirrors /free-tools tab UI from screenshots)
//   - Cards have the headline-with-purple-period flourish
//   - Pre-run copy ONLY (no $ figures). See feedback_no_pre_run_dollar_figures.

type FilterKey = 'all' | AgentCategory;

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all',         label: 'All' },
  { key: 'operations',  label: 'Operations' },
  { key: 'creative',    label: 'Creative' },
  { key: 'strategic',   label: 'Strategic' },
  { key: 'buyer',       label: 'Buyer' },
  { key: 'diagnostics', label: 'Diagnostics' },
  { key: 'client',      label: 'Client' },
  { key: 'context',     label: 'Context' },
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
      <PageHero
        eyebrow="Agent library"
        headline="Agents that actually understand Google Ads."
        description="You manage campaigns. Our agents handle the grind. Pick one to run now, or schedule a few to work while you sleep."
        variant="dark"
        actions={
          <>
            <PrimaryCTA>
              <Sparkle size={16} weight="fill" />
              Schedule a run
            </PrimaryCTA>
            <SecondaryButton variant="dark">How agents think</SecondaryButton>
          </>
        }
      />

      {/* Category tabs */}
      <div className="-mx-1 flex flex-wrap gap-2 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActive(f.key)}
            className={`inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-[13.5px] font-semibold tracking-tight transition-colors ${
              active === f.key
                ? 'bg-ppc-black text-white'
                : 'border border-ppc-neutral-100 bg-white text-ppc-neutral-700 hover:border-ppc-purple-300 hover:text-ppc-black'
            }`}
          >
            {f.label}
            <span
              className={`tabular rounded-md px-1.5 py-0.5 text-[10.5px] ${
                active === f.key ? 'bg-white/15 text-white' : 'bg-ppc-neutral-50 text-ppc-neutral-500'
              }`}
            >
              {counts[f.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Active category tagline */}
      {active !== 'all' && (
        <p className="-mt-8 text-[15px] tracking-tight text-ppc-neutral-600">
          {CATEGORIES[active]?.description}
        </p>
      )}

      {/* Grid — 2 columns on desktop so each card has room to breathe */}
      <div className="grid gap-5 lg:grid-cols-2">
        {visible.map((a) => (
          <AgentCard key={a.slug} agent={a} />
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent: a }: { agent: typeof AGENTS[number] }) {
  const hasPeriod = a.headline.endsWith('.');
  const headlineBody = hasPeriod ? a.headline.slice(0, -1) : a.headline;
  return (
    <Link
      to={`/agents/${a.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-ppc-neutral-100 bg-white p-8 transition-all hover:-translate-y-[2px] hover:border-ppc-purple-300 hover:shadow-ppc-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ppc-purple-50 text-[22px]">
          {a.emoji}
        </div>
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ppc-neutral-400">
          {CATEGORIES[a.category]?.label}
        </span>
      </div>

      <div className="mt-6 text-[13px] font-semibold uppercase tracking-[0.06em] text-ppc-neutral-500">
        {a.name}
      </div>
      <h3 className="mt-2 font-display text-[26px] font-bold leading-[1.08] tracking-[-0.02em] text-ppc-black">
        {headlineBody}
        {hasPeriod && <span className="text-ppc-purple-500">.</span>}
      </h3>
      <p className="mt-3 text-[14.5px] leading-relaxed text-ppc-neutral-600">
        {a.outcomeDescription}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-ppc-neutral-100 pt-5 text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-medium text-ppc-neutral-500">
          <Clock size={13} weight="duotone" />
          <span className="tabular">{a.expectedDuration}</span>
          <span className="text-ppc-neutral-400">· background</span>
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-ppc-purple-500 group-hover:gap-2 transition-[gap]">
          Open <ArrowUpRight size={13} weight="bold" />
        </span>
      </div>
    </Link>
  );
}
