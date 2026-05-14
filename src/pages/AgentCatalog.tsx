import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Sparkle, Stack, Star,
} from '@phosphor-icons/react';
import { AGENTS, CATEGORIES } from '../mock/agents';
import type { AgentCategory, AgentDefinition } from '../types/agent';

// Agent Catalog · /agents
//
// Layout (top-to-bottom):
//   1. Dark hero — "Agents that actually understand Google Ads."
//      with describe-bar + Schedule a stack / How agents think.
//   2. Colored filter pill row — category-tinted chips + count badges.
//   3. Most-run-this-week — two premium featured cards (purple top accent).
//   4. Category sections — mono-numbered headers + 3-col agent grids.
//
// Pre-run surface: no specific $ figures (feedback_no_pre_run_dollar_figures).

type FilterKey = 'all' | AgentCategory;

const FILTERS: Array<{ key: FilterKey; label: string; emoji?: string }> = [
  { key: 'all',         label: 'All agents' },
  { key: 'operations',  label: 'Operations',  emoji: '🛠️' },
  { key: 'creative',    label: 'Creative',    emoji: '✍️' },
  { key: 'strategic',   label: 'Strategic',   emoji: '🎯' },
  { key: 'buyer',       label: 'Buyer',       emoji: '💰' },
  { key: 'diagnostics', label: 'Diagnostics', emoji: '🔍' },
  { key: 'client',      label: 'Client',      emoji: '📝' },
  { key: 'context',     label: 'Context',     emoji: '🧭' },
];

// Tinted palette per category — sampled from the reference design.
// Used by both the filter pills and the section headers.
const CATEGORY_PALETTE: Record<AgentCategory, {
  chipBg: string; chipFg: string; chipCountBg: string;
  eyebrow: string; emoji: string; verb: string;
}> = {
  operations:  { chipBg: '#EEEDFE', chipFg: '#3C3489', chipCountBg: 'rgba(60, 52, 137, 0.15)',  eyebrow: '#534AB7', emoji: '🛠️', verb: 'Run the account' },
  creative:    { chipBg: '#FBEAF0', chipFg: '#72243E', chipCountBg: 'rgba(114, 36, 62, 0.12)',  eyebrow: '#72243E', emoji: '✍️',  verb: 'Make it convert' },
  strategic:   { chipBg: '#E6F1FB', chipFg: '#0C447C', chipCountBg: 'rgba(12, 68, 124, 0.12)',  eyebrow: '#0C447C', emoji: '🎯',  verb: 'See the bigger picture' },
  buyer:       { chipBg: '#EAF3DE', chipFg: '#27500A', chipCountBg: 'rgba(39, 80, 10, 0.12)',   eyebrow: '#27500A', emoji: '💰',  verb: "Know who you're selling to" },
  diagnostics: { chipBg: '#FAEEDA', chipFg: '#633806', chipCountBg: 'rgba(99, 56, 6, 0.12)',    eyebrow: '#633806', emoji: '🔍',  verb: 'Find the broken bits' },
  client:      { chipBg: '#E1F5EE', chipFg: '#085041', chipCountBg: 'rgba(8, 80, 65, 0.12)',    eyebrow: '#085041', emoji: '📝',  verb: 'Win + keep clients' },
  context:     { chipBg: '#F1EFE8', chipFg: '#2C2C2A', chipCountBg: 'rgba(44, 44, 42, 0.12)',   eyebrow: '#2C2C2A', emoji: '🧭',  verb: 'What the agents know about you' },
};

const CATEGORY_ORDER: AgentCategory[] = [
  'operations', 'diagnostics', 'strategic', 'creative', 'buyer', 'client', 'context',
];

// "Most run this week" — featured agents with their week-rank + stage counts.
const FEATURED: Array<{ slug: string; rank: number; stages: number }> = [
  { slug: 'competitor-spy', rank: 1, stages: 11 },
  { slug: 'weekly-audit',   rank: 2, stages: 8  },
];

// Agents that get a NEW chip — the recently shipped / staged-rollout ones.
const NEW_AGENTS = new Set<string>([
  'budget-pacer',
  'test-recommender',
  'change-impact',
  'context-enrichment',
]);

export function AgentCatalog() {
  const [active, setActive] = useState<FilterKey>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: AGENTS.length };
    AGENTS.forEach((a) => { c[a.category] = (c[a.category] || 0) + 1; });
    return c;
  }, []);

  const featuredAgents = useMemo(
    () => FEATURED
      .map((f) => {
        const agent = AGENTS.find((a) => a.slug === f.slug);
        return agent ? { agent, rank: f.rank, stages: f.stages } : null;
      })
      .filter((x): x is { agent: AgentDefinition; rank: number; stages: number } => x !== null),
    [],
  );

  const visibleCategories = active === 'all' ? CATEGORY_ORDER : [active];

  return (
    <div className="space-y-8">
      {/* ═══ 1 · DARK HERO ══════════════════════════════════════════════ */}
      <Hero count={AGENTS.length} />

      {/* ═══ 2 · FILTER PILLS ═══════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <FilterPill
            key={f.key}
            filter={f}
            active={active === f.key}
            count={counts[f.key] ?? 0}
            onSelect={() => setActive(f.key)}
          />
        ))}
      </div>

      {/* ═══ 3 · FEATURED · Most run this week ══════════════════════════ */}
      {active === 'all' && (
        <section>
          <div className="mb-3.5 flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span className="inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ppc-purple-500">
                <Star size={10} weight="fill" />
                Featured
              </span>
              <h3 className="text-[19px] font-semibold tracking-[-0.012em] text-ppc-ink">
                Most run this week<span className="text-ppc-purple-500">.</span>
              </h3>
            </div>
            <p className="text-[12px] text-ppc-text-muted">Across 60+ accounts</p>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {featuredAgents.map((f) => (
              <FeaturedAgentCard
                key={f.agent.slug}
                agent={f.agent}
                rank={f.rank}
                stages={f.stages}
              />
            ))}
          </div>
        </section>
      )}

      {/* ═══ 4 · CATEGORY SECTIONS ══════════════════════════════════════ */}
      <div className="space-y-9">
        {visibleCategories.map((cat, i) => {
          const inCat = AGENTS.filter((a) => a.category === cat);
          if (inCat.length === 0) return null;
          return (
            <section key={cat}>
              <SectionHead
                index={i + 1}
                category={cat}
                count={inCat.length}
              />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inCat.map((a) => <AgentCard key={a.slug} agent={a} />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ─── 1 · Dark hero ──────────────────────────────────────────────────────

function Hero({ count }: { count: number }) {
  return (
    <section className="relative overflow-hidden rounded-[20px] bg-black px-9 pb-9 pt-14 sm:px-12 sm:pt-16">
      {/* Three radial glows — top-right strong, mid soft, bottom-left whisper */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-[480px] w-[480px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.28) 0%, transparent 60%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[35%] top-[20%] h-[200px] w-[200px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.06) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 left-[10%] h-[280px] w-[280px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.10) 0%, transparent 65%)' }}
      />

      <div className="relative">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
          The agent library · {count} specialists
        </p>

        <h1 className="mt-3.5 max-w-[820px] font-display text-[44px] font-black leading-[0.96] tracking-[-0.035em] text-white sm:text-[58px]">
          <span className="text-ppc-purple-500">Agents</span> that actually
          <br className="hidden sm:block" />{' '}
          understand Google Ads<span className="text-ppc-purple-500">.</span>
        </h1>

        <p className="mt-5 max-w-[560px] text-[14.5px] leading-[1.55] text-white/60">
          Twenty-nine specialists, one team. Each reads your account the way a senior strategist would. Send one in, or stack a week of work to run while you sleep.
        </p>

        <HeroInput />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-[10px] bg-ppc-purple-500 px-4 py-2.5 text-[13.5px] font-semibold tracking-tight text-white shadow-[0_4px_14px_-4px_rgba(127,90,240,0.65)] transition-transform hover:-translate-y-[1px]">
            <Stack size={14} weight="duotone" />
            Schedule a stack
          </button>
          <button className="inline-flex items-center gap-2 rounded-[10px] border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[13.5px] font-semibold tracking-tight text-white/90 transition-colors hover:bg-white/[0.08]">
            How agents think
            <ArrowRight size={12} weight="bold" />
          </button>
        </div>
      </div>
    </section>
  );
}

function HeroInput() {
  return (
    <div className="mt-7 overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.05] backdrop-blur-sm">
      <div className="flex items-center gap-2.5 px-4 py-[14px]">
        <Sparkle size={16} weight="fill" className="text-white/55" />
        <span className="flex-1 text-[14px] text-white/55">
          Describe the work you need done, or browse below
        </span>
        <kbd className="rounded-[5px] border border-white/10 bg-white/[0.08] px-2 py-[3px] font-mono text-[10.5px] text-ppc-text-on-dark">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

// ─── 2 · Filter pills ───────────────────────────────────────────────────

function FilterPill({
  filter, active, count, onSelect,
}: {
  filter: { key: FilterKey; label: string; emoji?: string };
  active: boolean;
  count: number;
  onSelect: () => void;
}) {
  if (filter.key === 'all') {
    return (
      <button
        onClick={onSelect}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-[8px] text-[12.5px] font-medium tracking-tight transition-colors ${
          active
            ? 'bg-ppc-purple-500 text-white shadow-[0_4px_14px_-6px_rgba(127,90,240,0.55)]'
            : 'bg-white text-ppc-ink hover:bg-ppc-purple-50'
        }`}
      >
        {filter.label}
        <span
          className={`tabular-nums rounded-[8px] px-1.5 py-[1px] font-mono text-[10px] font-medium ${
            active ? 'bg-white/20 text-white' : 'bg-ppc-panel-soft text-ppc-purple-700'
          }`}
        >
          {String(count).padStart(2, '0')}
        </span>
      </button>
    );
  }

  const palette = CATEGORY_PALETTE[filter.key as AgentCategory];
  return (
    <button
      onClick={onSelect}
      style={
        active
          ? { background: palette.chipFg, color: '#fff' }
          : { background: palette.chipBg, color: palette.chipFg }
      }
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-[8px] text-[12.5px] font-medium tracking-tight transition-all hover:-translate-y-[0.5px]"
    >
      <span aria-hidden className="text-[13px] leading-none">{filter.emoji}</span>
      {filter.label}
      <span
        className="tabular-nums rounded-[8px] px-1.5 py-[1px] font-mono text-[10px] font-medium"
        style={
          active
            ? { background: 'rgba(255,255,255,0.22)', color: '#fff' }
            : { background: palette.chipCountBg, color: palette.chipFg }
        }
      >
        {String(count).padStart(2, '0')}
      </span>
    </button>
  );
}

// ─── 3 · Featured card ──────────────────────────────────────────────────

function FeaturedAgentCard({
  agent: a, rank, stages,
}: { agent: AgentDefinition; rank: number; stages: number }) {
  return (
    <Link
      to={`/agents/${a.slug}`}
      className="group relative flex flex-col rounded-[16px] border-[0.5px] border-ppc-card-border bg-white px-6 pt-5 pb-5 shadow-[0_0_0_4px_rgba(127,90,240,0.05)] transition-all hover:-translate-y-[1px] hover:shadow-[0_0_0_4px_rgba(127,90,240,0.10),0_8px_22px_-12px_rgba(127,90,240,0.35)]"
    >
      {/* Purple top edge */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] rounded-t-[16px] bg-ppc-purple-500"
      />

      <div className="flex items-center justify-between gap-3">
        <span
          aria-hidden
          className="grid h-12 w-12 place-items-center rounded-[12px] bg-ppc-panel-soft text-[28px] leading-none"
        >
          {a.emoji}
        </span>
        <span className="inline-flex items-center gap-1 rounded-[5px] bg-ppc-panel-soft px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ppc-purple-700">
          <Star size={9} weight="fill" />
          #{rank} This week
        </span>
      </div>

      <h4 className="mt-5 font-display text-[22px] font-bold leading-[1.1] tracking-[-0.018em] text-ppc-ink">
        {a.name}<span className="text-ppc-purple-500">.</span>
      </h4>

      <p className="mt-2 text-[13.5px] leading-[1.55] tracking-tight text-ppc-text-muted">
        {a.outcomeDescription}
      </p>

      <div className="mt-5 flex items-center justify-between border-t-[0.5px] border-ppc-card-border pt-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ppc-text-muted">
          {stages} stages · {a.expectedDuration}
        </span>
        <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500 transition-[gap] group-hover:gap-2">
          Send in <ArrowRight size={11} weight="bold" />
        </span>
      </div>
    </Link>
  );
}

// ─── 4 · Section head ───────────────────────────────────────────────────

function SectionHead({
  index, category, count,
}: { index: number; category: AgentCategory; count: number }) {
  const palette = CATEGORY_PALETTE[category];
  const label = CATEGORIES[category]?.label ?? category;
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b-[0.5px] border-ppc-card-border pb-2.5">
      <div className="flex items-baseline gap-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]">
        <span className="tabular-nums" style={{ color: palette.eyebrow }}>
          {String(index).padStart(2, '0')}
        </span>
        <span className="text-ppc-text-faint">·</span>
        <span className="inline-flex items-center gap-1.5" style={{ color: palette.eyebrow }}>
          <span aria-hidden className="text-[12px] leading-none">{palette.emoji}</span>
          {label}
        </span>
        <span
          className="ml-2 text-[14px] font-semibold tracking-[-0.005em] text-ppc-ink normal-case"
          style={{ letterSpacing: '-0.005em' }}
        >
          {palette.verb}
        </span>
      </div>
      <span className="tabular-nums font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ppc-text-faint">
        {String(count).padStart(2, '0')} agents
      </span>
    </div>
  );
}

// ─── 5 · Regular agent card ─────────────────────────────────────────────

function AgentCard({ agent: a }: { agent: AgentDefinition }) {
  const isNew = NEW_AGENTS.has(a.slug);
  return (
    <Link
      to={`/agents/${a.slug}`}
      className="group flex h-full flex-col rounded-[12px] border-[0.5px] border-ppc-card-border bg-white p-[18px] transition-all hover:-translate-y-[1px] hover:border-ppc-purple-300 hover:shadow-[0_8px_22px_-16px_rgba(127,90,240,0.45)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span aria-hidden className="text-[26px] leading-none">{a.emoji}</span>
        <span className="inline-flex items-center gap-1.5">
          {isNew && (
            <span className="rounded-[4px] bg-[#E1F5EE] px-[7px] py-[2.5px] font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[#0F6E56]">
              New
            </span>
          )}
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ppc-text-muted">
            {a.expectedDuration}
          </span>
        </span>
      </div>

      <h5 className="mt-2.5 text-[15px] font-semibold leading-[1.2] tracking-[-0.01em] text-ppc-ink">
        {a.name}<span className="text-ppc-purple-500">.</span>
      </h5>

      <p className="mt-1.5 text-[12.5px] leading-[1.55] tracking-tight text-ppc-text-muted">
        {a.outcomeDescription}
      </p>

      <div className="mt-auto flex items-center justify-between pt-3 text-[11.5px]">
        <span className="font-mono uppercase tracking-[0.08em] text-ppc-text-faint">
          {CATEGORIES[a.category]?.label}
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-ppc-text-muted transition-colors group-hover:text-ppc-purple-500">
          Open <ArrowUpRight size={11} weight="bold" />
        </span>
      </div>
    </Link>
  );
}

