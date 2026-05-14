import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, ArrowUpRight, Sparkle, Compass, Lightning, ArrowRight,
} from '@phosphor-icons/react';
import { AGENTS, CATEGORIES } from '../mock/agents';
import type { AgentCategory, AgentDefinition } from '../types/agent';
import { PageHero, PrimaryCTA, SecondaryButton } from '../components/PageHero';

// Agent Catalog · /agents
//
// Editorial rhythm — the goal is "a beautiful library of agents," not "a
// SaaS feature grid." Hierarchy beats density.
//
//   1. Dark hero with serif-italic "actually" accent word.
//   2. Meta strip — count of agents + range of run times. Builds trust
//      before the user starts filtering.
//   3. Filter pills (capsule tabs from /free-tools) + active-category lede.
//   4. "Pick of the week" — one editorial spread card at the top. Same
//      width as the page, presence equivalent to a magazine cover story.
//   5. Sectioned grid: when the filter is "all", agents are grouped by
//      category with a sheen-line divider and Space-Mono section eyebrow.
//      When a single category is active, the grouping drops and we just
//      flow the matching agents in a 2-col grid.
//   6. Closing band — schedule a stack of runs (TIME outcome).
//
// Hard rules respected:
//   - No pre-run $ figures. Compelling unspecific copy only.
//   - Title Case headlines, single purple period flourish.
//   - Hover treatment is arrow-translate + border colour, not coloured glow.
//   - Cards stay solid white. Feature card uses purple gradient (one per
//     screen, allowed per ANTI-PATTERNS.md §3).

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

// Display order when "All" is active — mirrors the seven category buckets,
// kept stable so muscle memory holds across visits.
const CATEGORY_ORDER: AgentCategory[] = [
  'operations',
  'strategic',
  'creative',
  'buyer',
  'diagnostics',
  'client',
  'context',
];

// "Pick of the week." Editorial spread at the top of the page.
// Sales Intelligence is the MONEY · APPROVAL agent for agencies — the pitch
// is "win the next account," which is the sharpest outcome story in the set.
const FEATURED_SLUG = 'sales-intelligence';

export function AgentCatalog() {
  const [active, setActive] = useState<FilterKey>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: AGENTS.length };
    AGENTS.forEach((a) => { c[a.category] = (c[a.category] || 0) + 1; });
    return c;
  }, []);

  const featured = useMemo(
    () => AGENTS.find((a) => a.slug === FEATURED_SLUG) ?? AGENTS[0],
    [],
  );

  const visible = active === 'all' ? AGENTS : AGENTS.filter((a) => a.category === active);

  return (
    <div className="space-y-14">
      {/* Dark editorial hero — same muscle memory as StagePage. */}
      <PageHero
        eyebrow="The agent library · 28 specialists"
        // The PageHero recognises the trailing period and renders it purple.
        // The italic accent word ("actually") is injected via a marker we
        // post-process here — but PageHero takes a string, so we use a
        // simpler variant: keep the headline plain and lean into the
        // description + actions to carry the editorial weight.
        headline="Agents that actually understand Google Ads."
        description="Twenty-eight specialists, one team. They read your accounts the way a senior strategist would. Pick one to run now, or stack a week of work to run while you sleep."
        variant="dark"
        actions={
          <>
            <PrimaryCTA>
              <Sparkle size={16} weight="fill" />
              Schedule a stack
            </PrimaryCTA>
            <SecondaryButton variant="dark">How the agents think</SecondaryButton>
          </>
        }
      />

      {/* Meta strip — sits under the hero with a sheen divider above, the
       *  way the /free-tools page anchors its tab UI. Numeric muscle
       *  shown in tabular Space Mono. */}
      <MetaStrip total={AGENTS.length} />

      {/* Filter pills — capsule tabs with count chips. The active pill is
       *  purple (not black) to keep the navigation closer to the marketing
       *  /free-tools tab UI rather than a hard binary toggle. */}
      <FilterRow active={active} counts={counts} onSelect={setActive} />

      {/* Active category lede — sub-headline that orients the user when
       *  they've narrowed the set. Kept off when "all" so the eye goes to
       *  the featured card. */}
      {active !== 'all' && (
        <ActiveCategoryLede category={active} count={counts[active] ?? 0} />
      )}

      {/* Featured spread — only shown when the user is on "All". This is
       *  the single highest-presence card on the page. */}
      {active === 'all' && <FeaturedCard agent={featured} />}

      {/* Body grid */}
      {active === 'all' ? (
        <GroupedGrid />
      ) : (
        <FlatGrid agents={visible} />
      )}

      {/* Closing band — TIME outcome, not MONEY. Quiet hand-off. */}
      <ClosingBand />
    </div>
  );
}

// ─── Meta strip ─────────────────────────────────────────────────────────

function MetaStrip({ total }: { total: number }) {
  return (
    <div className="-mt-4 flex flex-wrap items-center gap-x-10 gap-y-4 border-y border-white/8 py-5">
      <MetaPair label="In the library" value={String(total).padStart(2, '0')} />
      <MetaPair label="Run time range" value="6 to 45 min" />
      <MetaPair label="Categories" value="07" />
      <MetaPair label="Context they share" value="One project brain" />
      <div className="ml-auto inline-flex items-center gap-2 text-[12.5px] font-medium text-white/55">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-ppc-success" />
        All systems ready
      </div>
    </div>
  );
}

function MetaPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/45">
        {label}
      </span>
      <span className="tabular font-display text-[19px] font-bold leading-none tracking-[-0.015em] text-white">
        {value}
      </span>
    </div>
  );
}

// ─── Filter row ─────────────────────────────────────────────────────────

function FilterRow({
  active, counts, onSelect,
}: {
  active: FilterKey;
  counts: Record<string, number>;
  onSelect: (k: FilterKey) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((f) => {
        const isActive = active === f.key;
        return (
          <button
            key={f.key}
            onClick={() => onSelect(f.key)}
            className={`group inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-[13.5px] font-semibold tracking-tight transition-colors ${
              isActive
                ? 'border-ppc-purple-500 bg-ppc-purple-500 text-white shadow-[0_4px_14px_-4px_rgba(128,87,255,0.45)]'
                : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-ppc-purple-500/40 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            {f.label}
            <span
              className={`tabular rounded-md px-1.5 py-0.5 font-mono text-[10.5px] tracking-tight ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-white/[0.04] text-white/55 group-hover:bg-ppc-purple-500/15 group-hover:text-ppc-purple-300'
              }`}
            >
              {String(counts[f.key] ?? 0).padStart(2, '0')}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ActiveCategoryLede({
  category, count,
}: {
  category: AgentCategory;
  count: number;
}) {
  return (
    <div className="-mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2">
      <h2 className="font-display text-[34px] font-bold leading-[1.05] tracking-[-0.022em] text-white">
        {CATEGORIES[category]?.description.replace(/\.$/, '')}
        <span className="text-ppc-purple-400">.</span>
      </h2>
      <span className="tabular font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-white/55">
        {String(count).padStart(2, '0')} · {CATEGORIES[category]?.label}
      </span>
    </div>
  );
}

// ─── Featured spread ────────────────────────────────────────────────────

function FeaturedCard({ agent: a }: { agent: AgentDefinition }) {
  const hasPeriod = a.headline.endsWith('.');
  const headlineBody = hasPeriod ? a.headline.slice(0, -1) : a.headline;
  return (
    <Link
      to={`/agents/${a.slug}`}
      className="ppc-dark group relative block overflow-hidden rounded-3xl px-10 py-11 transition-shadow hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)] sm:px-12 sm:py-12"
      style={{
        backgroundImage:
          'radial-gradient(120% 80% at 18% 0%, rgba(128,87,255,0.18) 0%, transparent 55%), radial-gradient(80% 60% at 100% 100%, rgba(168,140,255,0.10) 0%, transparent 55%)',
      }}
    >
      {/* Sheen line at the top edge — same flourish as Audit-the-work
       *  reveal on the StagePage. */}
      <span className="pointer-events-none absolute left-10 right-10 top-0 h-px bg-grad-sheen sm:left-12 sm:right-12" />

      <div className="relative grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-end">
        {/* LEFT — headline + outcome story */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ppc-purple-300">
              Pick of the week
            </span>
            <span className="h-px w-10 bg-white/15" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
              {CATEGORIES[a.category]?.label}
            </span>
          </div>

          <h2 className="mt-6 max-w-[640px] font-display text-[52px] font-extrabold leading-[0.98] tracking-[-0.032em] text-white sm:text-[58px]">
            {headlineBody}
            {hasPeriod && <span className="text-ppc-purple-400">.</span>}
          </h2>

          <p className="mt-6 max-w-[540px] text-[17px] leading-[1.55] tracking-tight text-white/75">
            {a.outcomeDescription}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
            <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-white">
              <Clock size={14} weight="duotone" className="text-ppc-purple-300" />
              <span className="tabular">{a.expectedDuration}</span>
              <span className="text-white/45">· runs in the background</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-pill border border-ppc-purple-500/30 bg-ppc-purple-500/15 px-3 py-1.5 text-[12.5px] font-semibold tracking-tight text-ppc-purple-300">
              <Sparkle size={11} weight="fill" />
              {a.name}
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white transition-transform group-hover:translate-x-1">
              Open agent <ArrowUpRight size={14} weight="bold" />
            </span>
          </div>
        </div>

        {/* RIGHT — "how this one thinks" mini-rundown, mirrors the
         *  StagePage's just-completed list style. */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7"
             style={{
               backgroundImage:
                 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))',
             }}>
          <div className="mb-5 flex items-center justify-between">
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/55">
              How this one thinks
            </span>
            <Compass size={14} weight="duotone" className="text-ppc-purple-300" />
          </div>
          <ol className="flex flex-col gap-4">
            {a.thinkingSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="tabular mt-[2px] inline-grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ppc-purple-500/15 font-mono text-[10px] font-bold text-ppc-purple-300">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[14px] leading-[1.5] tracking-tight text-white/80">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Link>
  );
}

// ─── Grouped grid (when filter = "all") ─────────────────────────────────

function GroupedGrid() {
  const featuredSlug = FEATURED_SLUG;
  return (
    <div className="space-y-16">
      {CATEGORY_ORDER.map((cat, sectionIndex) => {
        const inCat = AGENTS.filter(
          (a) => a.category === cat && a.slug !== featuredSlug,
        );
        if (inCat.length === 0) return null;
        return (
          <section key={cat}>
            <SectionHead
              index={sectionIndex + 1}
              eyebrow={CATEGORIES[cat]?.label ?? cat}
              title={CATEGORIES[cat]?.description ?? ''}
              count={inCat.length}
            />
            <div className="grid gap-5 lg:grid-cols-2">
              {inCat.map((a) => <AgentCard key={a.slug} agent={a} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SectionHead({
  index, eyebrow, title, count,
}: {
  index: number;
  eyebrow: string;
  title: string;
  count: number;
}) {
  const hasPeriod = title.endsWith('.');
  const body = hasPeriod ? title.slice(0, -1) : title;
  return (
    <div className="mb-7">
      <hr className="ppc-sheen mb-7" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/55">
            {String(index).padStart(2, '0')} · {eyebrow}
          </div>
          <h2 className="mt-2 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.022em] text-white">
            {body}
            {hasPeriod && <span className="text-ppc-purple-400">.</span>}
          </h2>
        </div>
        <span className="tabular font-mono text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/45">
          {String(count).padStart(2, '0')} {count === 1 ? 'agent' : 'agents'}
        </span>
      </div>
    </div>
  );
}

// ─── Flat grid (when a single category is filtered) ─────────────────────

function FlatGrid({ agents }: { agents: AgentDefinition[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {agents.map((a) => <AgentCard key={a.slug} agent={a} />)}
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────

function AgentCard({ agent: a }: { agent: AgentDefinition }) {
  const hasPeriod = a.headline.endsWith('.');
  const headlineBody = hasPeriod ? a.headline.slice(0, -1) : a.headline;
  return (
    <Link
      to={`/agents/${a.slug}`}
      className="group relative flex h-full flex-col rounded-2xl border border-white/8 bg-white/[0.04] p-8 transition-colors hover:border-ppc-purple-500/40 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl bg-ppc-purple-500/15 text-[22px] transition-colors group-hover:bg-ppc-purple-500/25"
          aria-hidden="true"
        >
          {a.emoji}
        </span>
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/45">
          {a.name}
        </span>
      </div>

      <h3 className="mt-7 font-display text-[26px] font-bold leading-[1.08] tracking-[-0.022em] text-white">
        {headlineBody}
        {hasPeriod && <span className="text-ppc-purple-400">.</span>}
      </h3>

      <p className="mt-3 text-[14.5px] leading-[1.55] tracking-tight text-white/65">
        {a.outcomeDescription}
      </p>

      {/* Bottom meta — Clock + Open arrow on a hairline. */}
      <div className="mt-7 flex items-center justify-between border-t border-white/8 pt-5 text-[13px]">
        <span className="inline-flex items-center gap-2 font-medium text-white/70">
          <Clock size={13} weight="duotone" className="text-ppc-purple-300" />
          <span className="tabular">{a.expectedDuration}</span>
          <span className="text-white/45">· background</span>
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-ppc-purple-300 transition-transform group-hover:translate-x-1">
          Open <ArrowUpRight size={13} weight="bold" />
        </span>
      </div>
    </Link>
  );
}

// ─── Closing band ──────────────────────────────────────────────────────

function ClosingBand() {
  return (
    <section className="ppc-dark relative overflow-hidden rounded-3xl px-10 py-11 sm:px-12 sm:py-12"
             style={{
               backgroundImage:
                 'radial-gradient(120% 80% at 80% 0%, rgba(128,87,255,0.16) 0%, transparent 60%)',
             }}>
      <span className="pointer-events-none absolute left-10 right-10 top-0 h-px bg-grad-sheen sm:left-12 sm:right-12" />
      <div className="relative flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-[560px]">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ppc-purple-300">
            <Lightning size={12} weight="fill" />
            Stack a week of work
          </div>
          <h2 className="mt-4 font-display text-[40px] font-extrabold leading-[1.0] tracking-[-0.028em] text-white sm:text-[44px]">
            Pick five. Press go. See you Friday<span className="text-ppc-purple-400">.</span>
          </h2>
          <p className="mt-4 text-[16px] leading-[1.55] tracking-tight text-white/70">
            Schedule a stack of agents to run on a cadence and inherit the same project context. Your week comes back to you.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <PrimaryCTA>
            <Sparkle size={16} weight="fill" />
            Build a stack
          </PrimaryCTA>
          <SecondaryButton variant="dark">
            See an example week <ArrowRight size={14} weight="bold" />
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}
