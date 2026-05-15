import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, CaretDown, Funnel,
  GridFour, ListBullets, MagnifyingGlass, Robot,
  Sparkle, PaperPlaneTilt,
} from '@phosphor-icons/react';
import { AGENTS } from '../mock/agents';
import { PROJECTS } from '../mock/projects';
import type { AgentCategory, AgentDefinition } from '../types/agent';

// Agent Catalog · /agents
//
// Layout (top-to-bottom):
//   1. Light hero — "What do you want to accomplish?" + describe-bar
//      + chip suggestions, with AI Advisor dark card on the right.
//   2. Recommended for you — 3 cards tuned to recent activity.
//   3. Browse all specialists — 5 primary pills + More overflow,
//      Filters + grid/list toggle, unified 3-col agent grid.
//   4. "Not sure where to start?" — dark banner with sine-wave + CTA.
//
// Pre-run rules honoured here:
//   - No $ figures pre-run (feedback_no_pre_run_dollar_figures)
//   - No duration chips pre-run (feedback_no_pre_run_duration_claims) —
//     even though the source mockup showed them, Stewart's locked rule
//     wins. The card slot is replaced with a category-only chip.

// ─── Filter row ─────────────────────────────────────────────────────────
// Underlying data has 7 categories; the surface shows 5 primary pills +
// "More" overflow. `buyer` and `client` collapse into a single "Growth"
// pill, matching how the mockup labels client/buyer agents.

type FilterKey = 'all' | AgentCategory | 'growth';

const PRIMARY_FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all',         label: 'All' },
  { key: 'operations',  label: 'Operations' },
  { key: 'diagnostics', label: 'Diagnostics' },
  { key: 'strategic',   label: 'Strategy' },
  { key: 'creative',    label: 'Creative' },
  { key: 'growth',      label: 'Growth' },
];

const MORE_FILTERS: Array<{ key: AgentCategory; label: string }> = [
  { key: 'context', label: 'Context' },
];

// Display labels surfaced on cards/rows. Map collapses buyer+client to
// "Growth" so the bottom chip on each card matches the pill that opens it.
const CATEGORY_LABEL: Record<AgentCategory, string> = {
  operations:  'Operations',
  diagnostics: 'Diagnostics',
  strategic:   'Strategy',
  creative:    'Creative',
  buyer:       'Growth',
  client:      'Growth',
  context:     'Context',
};

// Italic-serif period — workspace signature mark. Keeps the brand's
// editorial cadence across every section heading.
function P({ char = '.' }: { char?: '.' | '?' }) {
  return (
    <span
      className="font-serif italic text-ppc-purple-500"
      style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
    >
      {char}
    </span>
  );
}

// ─── Tinted palette per category ────────────────────────────────────────
// Drives icon-container fill, category chip, and "More" menu item dot.

const CATEGORY_PALETTE: Record<AgentCategory, {
  iconBg: string;     // soft tint behind emoji
  chipBg: string;     // category chip background
  chipFg: string;     // category chip text
  dot:    string;     // solid accent (More menu, hover)
}> = {
  operations:  { iconBg: '#EEEDFE', chipBg: '#EEEDFE', chipFg: '#3C3489', dot: '#7F5AF0' },
  diagnostics: { iconBg: '#FAEEDA', chipBg: '#FAEEDA', chipFg: '#633806', dot: '#C28A2C' },
  strategic:   { iconBg: '#E6F1FB', chipBg: '#E6F1FB', chipFg: '#0C447C', dot: '#2671B8' },
  creative:    { iconBg: '#FBEAF0', chipBg: '#FBEAF0', chipFg: '#72243E', dot: '#B83361' },
  buyer:       { iconBg: '#EAF3DE', chipBg: '#EAF3DE', chipFg: '#27500A', dot: '#5C9B2E' },
  client:      { iconBg: '#E1F5EE', chipBg: '#E1F5EE', chipFg: '#085041', dot: '#0F8C71' },
  context:     { iconBg: '#F1EFE8', chipBg: '#F1EFE8', chipFg: '#2C2C2A', dot: '#6B6964' },
};

// ─── Suggestion chips below the search bar ──────────────────────────────

const SUGGESTIONS = [
  'Find wasted spend',
  'Audit my account',
  'Analyze my competitors',
  'Improve ROAS',
];

// ─── Recommended for you ────────────────────────────────────────────────
// Three hand-picked agents with priority tags. Order matters: the first
// card is the strongest impact pick.

const RECOMMENDED: Array<{ slug: string; tag: 'high' | 'routine' }> = [
  { slug: 'spend-leak',       tag: 'high'    },
  { slug: 'negative-keyword', tag: 'high'    },
  { slug: 'weekly-audit',     tag: 'routine' },
];

const TAG_LABEL: Record<'high' | 'routine', string> = {
  high:    'High potential impact',
  routine: 'Routine check',
};

// ════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════

export function AgentCatalog() {
  const [active, setActive] = useState<FilterKey>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [moreOpen, setMoreOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: AGENTS.length };
    AGENTS.forEach((a) => { c[a.category] = (c[a.category] || 0) + 1; });
    c.growth = (c.buyer || 0) + (c.client || 0);
    return c;
  }, []);

  const visibleAgents = useMemo(() => {
    if (active === 'all') return AGENTS;
    if (active === 'growth') {
      return AGENTS.filter((a) => a.category === 'buyer' || a.category === 'client');
    }
    return AGENTS.filter((a) => a.category === active);
  }, [active]);

  const recommendedAgents = useMemo(
    () => RECOMMENDED
      .map((r) => {
        const a = AGENTS.find((x) => x.slug === r.slug);
        return a ? { agent: a, tag: r.tag } : null;
      })
      .filter((x): x is { agent: AgentDefinition; tag: 'high' | 'routine' } => x !== null),
    [],
  );

  return (
    <div className="space-y-12">
      <HeroBlock />
      <RecommendedSection items={recommendedAgents} />

      <BrowseSection
        active={active}
        counts={counts}
        view={view}
        moreOpen={moreOpen}
        onSelectFilter={(k) => { setActive(k); setMoreOpen(false); }}
        onToggleView={() => setView(view === 'grid' ? 'list' : 'grid')}
        onToggleMore={() => setMoreOpen((v) => !v)}
        agents={visibleAgents}
      />

      <PlanCtaBanner />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 1 · HERO
// ════════════════════════════════════════════════════════════════════════

function HeroBlock() {
  const runningCount = 4; // mock — eventually wired to actual run-state
  return (
    <section className="grid items-start gap-6 lg:grid-cols-[1fr_440px]">
      <div className="flex flex-col">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ppc-purple-700">
          <Sparkle size={10} weight="fill" />
          Agents
        </span>

        <h1 className="mt-3 font-display text-[42px] font-black leading-[1.02] tracking-[-0.028em] text-ppc-ink sm:text-[48px]">
          What do you want
          <br />
          to{' '}
          <span
            className="font-serif italic font-bold text-ppc-purple-500"
            style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
          >
            accomplish
          </span>
          <P char="?" />
        </h1>

        <div className="mt-7">
          <SearchBar />

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[12px] text-ppc-text-muted">Try asking:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="rounded-full border-[0.5px] border-ppc-card-border bg-white px-3 py-[6px] text-[12px] font-medium text-ppc-text-muted transition-all hover:-translate-y-[0.5px] hover:border-ppc-purple-300 hover:text-ppc-ink"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace stat strip — bulks the left column so it visually
         * balances the taller ScheduleCard without leaving a dead zone
         * between the chips and the next section. */}
        <WorkspaceStatStrip
          specialists={AGENTS.length}
          projects={PROJECTS.length}
          running={runningCount}
        />
      </div>

      <ScheduleCard projectCount={PROJECTS.length} />
    </section>
  );
}

function WorkspaceStatStrip({
  specialists, projects, running,
}: { specialists: number; projects: number; running: number }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t-[0.5px] border-ppc-card-border pt-4 font-mono text-[11px] tracking-[0.04em] text-ppc-text-muted">
      <Stat label="specialists" value={specialists} />
      <Divider />
      <Stat label="projects" value={projects} />
      <Divider />
      <span className="inline-flex items-center gap-1.5">
        <span
          className="h-[6px] w-[6px] rounded-full bg-[#5DC2A2]"
          style={{ boxShadow: '0 0 0 2px rgba(93,194,162,0.22), 0 0 8px rgba(93,194,162,0.55)' }}
        />
        <span className="tabular-nums text-ppc-ink">{running}</span>
        <span className="uppercase tracking-[0.12em] text-ppc-text-muted">running now</span>
      </span>
      <Divider />
      <Link
        to="/chat?intent=how-agents-think"
        className="inline-flex items-center gap-1 text-ppc-purple-500 transition-colors hover:text-ppc-purple-700"
      >
        How agents think
        <ArrowRight size={10} weight="bold" />
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="tabular-nums text-[13px] font-semibold text-ppc-ink">{value}</span>
      <span className="uppercase tracking-[0.12em] text-ppc-text-muted">{label}</span>
    </span>
  );
}

function Divider() {
  return <span aria-hidden className="h-3 w-px bg-ppc-card-border" />;
}

function SearchBar() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center gap-2 rounded-[14px] border-[0.5px] border-ppc-card-border bg-white py-2.5 pl-4 pr-2.5 shadow-[0_2px_10px_-6px_rgba(15,10,30,0.08)] focus-within:border-ppc-purple-300 focus-within:shadow-[0_0_0_4px_rgba(127,90,240,0.10),0_4px_14px_-6px_rgba(127,90,240,0.25)]"
    >
      <MagnifyingGlass size={16} weight="bold" className="shrink-0 text-ppc-text-muted" />
      <input
        type="text"
        placeholder="Search agents or describe what you need…"
        className="min-w-0 flex-1 bg-transparent text-[14px] tracking-[-0.005em] text-ppc-ink placeholder:text-ppc-text-muted/85 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Submit"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-ppc-purple-500 text-white shadow-[0_4px_14px_-4px_rgba(127,90,240,0.55)] transition-all hover:-translate-y-[1px] hover:bg-ppc-purple-600"
      >
        <PaperPlaneTilt size={14} weight="fill" />
      </button>
    </form>
  );
}

// ─── Schedule card — THE primary action on /agents ──────────────────────
//
// Stewart 2026-05-15: "this is like the MOST important concept in the
// entire app." Users describe their accounts to the AI; the AI designs
// a per-project launch plan that runs the right agents at the right
// cadence. Discoverable post-onboarding for adjustments, too.
//
// Visual job: out-weigh everything else above the fold. Big headline,
// generous padding, decorative plan-stack motif, primary CTA.

function ScheduleCard({ projectCount }: { projectCount: number }) {
  return (
    <Link
      to="/chat?intent=schedule"
      className="group relative flex flex-col overflow-hidden rounded-[20px] p-7 text-white transition-transform hover:-translate-y-[1px] sm:p-8"
      style={{
        background:
          'linear-gradient(160deg, #261850 0%, #150D2C 55%, #0A0618 100%)',
        boxShadow:
          'inset 0 0 0 1px rgba(127,90,240,0.30), 0 14px 40px -18px rgba(127,90,240,0.55)',
      }}
    >
      {/* Top-right purple bloom — stronger than the prior advisor card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 h-[300px] w-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.42) 0%, transparent 60%)' }}
      />
      {/* Soft underglow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 h-[260px] w-[260px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.18) 0%, transparent 65%)' }}
      />
      {/* Decorative plan-stack motif — three faint stacked cards in the
        top-right, suggesting "a schedule of plays." Aria-hidden. */}
      <PlanStackMotif />

      <div className="relative flex items-start justify-between gap-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-[5px] font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75 ring-1 ring-inset ring-white/10">
          <span className="h-[5px] w-[5px] rounded-full bg-[#A88CFF] shadow-[0_0_8px_rgba(168,140,255,0.85)]" />
          Agent Schedule
        </span>
        <AdvisorOrb />
      </div>

      <h2
        className="relative mt-5 font-display font-black leading-[1.02] tracking-[-0.026em]"
        style={{ fontSize: 'clamp(28px, 3.4vw, 36px)' }}
      >
        Create your
        <br />
        agent{' '}
        <span
          className="font-serif italic font-bold text-[#C7B0FF]"
          style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
        >
          schedule
        </span>
        <span
          className="font-serif italic text-[#C7B0FF]"
          style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
        >
          .
        </span>
      </h2>

      <p className="relative mt-4 max-w-[340px] text-[14px] leading-[1.55] text-white/72">
        Tell us about your accounts. We&rsquo;ll design a launch plan that
        runs the right agents, on the right cadence, for every project.
      </p>

      <div className="relative mt-auto pt-6">
        <div className="flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-[12px] px-5 py-[12px] text-[14.5px] font-semibold tracking-tight text-white transition-all group-hover:-translate-y-[1px]"
            style={{
              background: 'linear-gradient(155deg, #A88CFF 0%, #7F5AF0 55%, #534AB7 100%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 26px -10px rgba(127,90,240,0.75)',
            }}
          >
            <Sparkle size={14} weight="fill" />
            Start the conversation
            <ArrowRight size={13} weight="bold" className="transition-transform group-hover:translate-x-[1px]" />
          </span>

          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/45">
            {projectCount} project{projectCount === 1 ? '' : 's'}
          </span>
        </div>

        <p className="mt-3 text-[12px] text-white/45">
          Already onboarded? Adjust an existing schedule any time.
        </p>
      </div>
    </Link>
  );
}

// Mascot orb — Phosphor Robot inside a soft purple bloom. Used inline
// with the eyebrow on the ScheduleCard.
function AdvisorOrb() {
  return (
    <div className="relative h-[64px] w-[64px] shrink-0">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(168,140,255,0.50) 0%, rgba(127,90,240,0.22) 45%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-[7px] grid place-items-center rounded-full"
        style={{
          background:
            'linear-gradient(155deg, #3A2670 0%, #170E30 100%)',
          boxShadow:
            'inset 0 0 0 1px rgba(199,176,255,0.30), 0 0 18px -2px rgba(127,90,240,0.55)',
        }}
      >
        <Robot size={26} weight="duotone" className="text-[#C7B0FF]" />
      </div>
    </div>
  );
}

// Three faint stacked cards behind the headline — visual shorthand for
// "a schedule of plays". Purely decorative.
function PlanStackMotif() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 140"
      className="pointer-events-none absolute right-[-30px] top-[140px] h-[140px] w-[220px] opacity-[0.18]"
    >
      <defs>
        <linearGradient id="planStackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="#C7B0FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7F5AF0" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* back card */}
      <rect x="48" y="22" width="160" height="32" rx="9"
        fill="none" stroke="url(#planStackGrad)" strokeWidth="1" />
      {/* mid card */}
      <rect x="34" y="60" width="170" height="32" rx="9"
        fill="none" stroke="url(#planStackGrad)" strokeWidth="1.1" />
      {/* front card */}
      <rect x="18" y="98" width="180" height="32" rx="9"
        fill="none" stroke="url(#planStackGrad)" strokeWidth="1.2" />
      {/* dots on each card */}
      <circle cx="62" cy="38" r="2" fill="#C7B0FF" />
      <circle cx="48" cy="76" r="2" fill="#C7B0FF" />
      <circle cx="32" cy="114" r="2" fill="#C7B0FF" />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 2 · RECOMMENDED FOR YOU
// ════════════════════════════════════════════════════════════════════════

function RecommendedSection({
  items,
}: { items: Array<{ agent: AgentDefinition; tag: 'high' | 'routine' }> }) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-[19px] font-bold tracking-[-0.012em] text-ppc-ink">
            Recommended for you<P />
          </h2>
          <p className="mt-0.5 text-[12.5px] text-ppc-text-muted">
            Based on your accounts and recent activity.
          </p>
        </div>
        <Link
          to="/chat"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500 hover:text-ppc-purple-600"
        >
          Why these?
          <ArrowRight size={11} weight="bold" />
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <RecommendedCard key={it.agent.slug} agent={it.agent} tag={it.tag} />
        ))}
      </div>
    </section>
  );
}

function RecommendedCard({
  agent: a, tag,
}: { agent: AgentDefinition; tag: 'high' | 'routine' }) {
  const palette = CATEGORY_PALETTE[a.category];
  return (
    <Link
      to={`/agents/${a.slug}`}
      className="group flex h-full flex-col rounded-[14px] border-[0.5px] border-ppc-card-border bg-white p-5 transition-all hover:-translate-y-[1px] hover:border-ppc-purple-300 hover:shadow-[0_10px_28px_-18px_rgba(127,90,240,0.40)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className="grid h-11 w-11 place-items-center rounded-[11px] text-[22px] leading-none"
          style={{ background: palette.iconBg }}
        >
          {a.emoji}
        </span>
      </div>

      <h3 className="mt-4 font-display text-[17px] font-bold leading-[1.2] tracking-[-0.012em] text-ppc-ink">
        {a.name}<P />
      </h3>

      <span
        className={`mt-1.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-[2px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em] ${
          tag === 'high'
            ? 'bg-[#EEEDFE] text-[#3C3489]'
            : 'bg-[#F1EFE8] text-[#2C2C2A]'
        }`}
      >
        {TAG_LABEL[tag]}
      </span>

      <p className="mt-2.5 text-[12.5px] leading-[1.55] tracking-tight text-ppc-text-muted">
        {a.outcomeDescription}
      </p>

      <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500 transition-[gap] group-hover:gap-2">
        Run now <ArrowRight size={11} weight="bold" />
      </span>
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 3 · BROWSE ALL SPECIALISTS
// ════════════════════════════════════════════════════════════════════════

interface BrowseSectionProps {
  active: FilterKey;
  counts: Record<string, number>;
  view: 'grid' | 'list';
  moreOpen: boolean;
  onSelectFilter: (k: FilterKey) => void;
  onToggleView: () => void;
  onToggleMore: () => void;
  agents: AgentDefinition[];
}

function BrowseSection({
  active, counts, view, moreOpen,
  onSelectFilter, onToggleView, onToggleMore,
  agents,
}: BrowseSectionProps) {
  return (
    <section>
      <h2 className="font-display text-[19px] font-bold tracking-[-0.012em] text-ppc-ink">
        Browse all specialists<P />
      </h2>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {PRIMARY_FILTERS.map((f) => (
          <FilterPill
            key={f.key}
            label={f.label}
            count={counts[f.key] ?? 0}
            active={active === f.key}
            onSelect={() => onSelectFilter(f.key)}
          />
        ))}

        <MoreFilter
          open={moreOpen}
          activeKey={active}
          counts={counts}
          onToggle={onToggleMore}
          onSelect={(k) => onSelectFilter(k)}
        />

        <span className="mx-1 h-5 w-px bg-ppc-card-border" />

        <button className="inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-ppc-card-border bg-white px-3 py-[7px] text-[12px] font-medium text-ppc-ink transition-colors hover:border-ppc-purple-300">
          <Funnel size={12} weight="bold" />
          Filters
        </button>

        <div className="inline-flex overflow-hidden rounded-full border-[0.5px] border-ppc-card-border bg-white">
          <button
            aria-label="Grid view"
            onClick={view === 'list' ? onToggleView : undefined}
            className={`grid h-[28px] w-[30px] place-items-center transition-colors ${
              view === 'grid'
                ? 'bg-ppc-panel-soft text-ppc-purple-700'
                : 'text-ppc-text-muted hover:text-ppc-ink'
            }`}
          >
            <GridFour size={12} weight="bold" />
          </button>
          <button
            aria-label="List view"
            onClick={view === 'grid' ? onToggleView : undefined}
            className={`grid h-[28px] w-[30px] place-items-center transition-colors ${
              view === 'list'
                ? 'bg-ppc-panel-soft text-ppc-purple-700'
                : 'text-ppc-text-muted hover:text-ppc-ink'
            }`}
          >
            <ListBullets size={12} weight="bold" />
          </button>
        </div>
      </div>

      <div
        className={`mt-6 ${
          view === 'grid'
            ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-2'
        }`}
      >
        {agents.map((a) =>
          view === 'grid'
            ? <AgentCard key={a.slug} agent={a} />
            : <AgentRow key={a.slug} agent={a} />,
        )}
      </div>
    </section>
  );
}

function FilterPill({
  label, count, active, onSelect,
}: { label: string; count: number; active: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-[7px] text-[12.5px] font-medium tracking-tight transition-all ${
        active
          ? 'bg-ppc-purple-500 text-white shadow-[0_4px_14px_-6px_rgba(127,90,240,0.55)]'
          : 'border-[0.5px] border-ppc-card-border bg-white text-ppc-ink hover:-translate-y-[0.5px] hover:border-ppc-purple-300'
      }`}
    >
      {label}
      <span
        className={`tabular-nums font-mono text-[10px] font-semibold ${
          active ? 'text-white/85' : 'text-ppc-text-muted'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function MoreFilter({
  open, activeKey, counts, onToggle, onSelect,
}: {
  open: boolean;
  activeKey: FilterKey;
  counts: Record<string, number>;
  onToggle: () => void;
  onSelect: (k: AgentCategory) => void;
}) {
  const moreActiveLabel = MORE_FILTERS.find((m) => m.key === activeKey)?.label;
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-[7px] text-[12.5px] font-medium tracking-tight transition-all ${
          moreActiveLabel
            ? 'bg-ppc-purple-500 text-white shadow-[0_4px_14px_-6px_rgba(127,90,240,0.55)]'
            : 'border-[0.5px] border-ppc-card-border bg-white text-ppc-ink hover:-translate-y-[0.5px] hover:border-ppc-purple-300'
        }`}
      >
        {moreActiveLabel ?? 'More'}
        <CaretDown
          size={10}
          weight="bold"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={onToggle}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute left-0 top-full z-20 mt-1.5 min-w-[180px] overflow-hidden rounded-[12px] border-[0.5px] border-ppc-card-border bg-white shadow-[0_12px_30px_-12px_rgba(15,10,30,0.20)]">
            {MORE_FILTERS.map((m) => {
              const palette = CATEGORY_PALETTE[m.key];
              const isActive = activeKey === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => onSelect(m.key)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                    isActive ? 'bg-ppc-panel-soft' : 'hover:bg-ppc-panel-soft/60'
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ background: palette.dot }}
                  />
                  <span className="flex-1 text-ppc-ink">{m.label}</span>
                  <span className="font-mono text-[10.5px] tabular-nums text-ppc-text-muted">
                    {counts[m.key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Card (grid view) ────────────────────────────────────────────────────

function AgentCard({ agent: a }: { agent: AgentDefinition }) {
  const palette = CATEGORY_PALETTE[a.category];
  const categoryLabel = CATEGORY_LABEL[a.category];
  return (
    <Link
      to={`/agents/${a.slug}`}
      className="group flex h-full flex-col rounded-[14px] border-[0.5px] border-ppc-card-border bg-white p-5 transition-all hover:-translate-y-[1px] hover:border-ppc-purple-300 hover:shadow-[0_10px_28px_-18px_rgba(127,90,240,0.40)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className="grid h-11 w-11 place-items-center rounded-[11px] text-[22px] leading-none"
          style={{ background: palette.iconBg }}
        >
          {a.emoji}
        </span>
        <ArrowUpRight
          size={13}
          weight="bold"
          className="mt-1 text-ppc-text-faint transition-colors group-hover:text-ppc-purple-500"
        />
      </div>

      <h3 className="mt-4 font-display text-[16px] font-bold leading-[1.2] tracking-[-0.012em] text-ppc-ink">
        {a.name}<P />
      </h3>

      <p className="mt-1.5 text-[12.5px] leading-[1.55] tracking-tight text-ppc-text-muted">
        {a.outcomeDescription}
      </p>

      <div className="mt-auto pt-4">
        <span
          className="inline-flex items-center rounded-[5px] px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em]"
          style={{ background: palette.chipBg, color: palette.chipFg }}
        >
          {categoryLabel}
        </span>
      </div>
    </Link>
  );
}

// ─── Row (list view) ────────────────────────────────────────────────────

function AgentRow({ agent: a }: { agent: AgentDefinition }) {
  const palette = CATEGORY_PALETTE[a.category];
  const categoryLabel = CATEGORY_LABEL[a.category];
  return (
    <Link
      to={`/agents/${a.slug}`}
      className="group flex items-center gap-4 rounded-[12px] border-[0.5px] border-ppc-card-border bg-white px-4 py-3 transition-all hover:-translate-y-[0.5px] hover:border-ppc-purple-300"
    >
      <span
        aria-hidden
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] text-[19px] leading-none"
        style={{ background: palette.iconBg }}
      >
        {a.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-[14px] font-semibold leading-tight tracking-[-0.01em] text-ppc-ink">
          {a.name}
        </h4>
        <p className="truncate text-[12px] leading-[1.4] tracking-tight text-ppc-text-muted">
          {a.outcomeDescription}
        </p>
      </div>
      <span
        className="hidden shrink-0 rounded-[5px] px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em] sm:inline-flex"
        style={{ background: palette.chipBg, color: palette.chipFg }}
      >
        {categoryLabel}
      </span>
      <ArrowUpRight
        size={13}
        weight="bold"
        className="shrink-0 text-ppc-text-faint transition-colors group-hover:text-ppc-purple-500"
      />
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 4 · "NOT SURE WHERE TO START?" BANNER
// ════════════════════════════════════════════════════════════════════════

function PlanCtaBanner() {
  return (
    <Link
      to="/chat"
      className="group relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-[18px] px-7 py-6 text-white transition-transform hover:-translate-y-[1px]"
      style={{
        background:
          'linear-gradient(95deg, #0F0A1E 0%, #1A1030 60%, #0F0A1E 100%)',
        boxShadow:
          'inset 0 0 0 1px rgba(127,90,240,0.22), 0 10px 30px -18px rgba(127,90,240,0.55)',
      }}
    >
      <SineWave />

      <div className="relative max-w-[460px]">
        <h3 className="font-display text-[20px] font-bold leading-[1.18] tracking-[-0.015em]">
          Not sure where to start<span className="text-ppc-purple-300">?</span>
        </h3>
        <p className="mt-1 text-[13px] text-white/65">
          Get a personalised plan in 60 seconds.
        </p>
      </div>

      <span
        className="relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_8px_22px_-10px_rgba(127,90,240,0.65)] transition-all group-hover:-translate-y-[1px]"
        style={{
          background: 'linear-gradient(180deg, #7F5AF0 0%, #534AB7 100%)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 22px -10px rgba(127,90,240,0.65)',
        }}
      >
        Generate my plan
        <Sparkle size={13} weight="fill" />
      </span>
    </Link>
  );
}

// Decorative purple sine wave in the banner background.
function SineWave() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 120"
      className="pointer-events-none absolute inset-y-0 right-[140px] h-full w-[420px] opacity-90"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor="#7F5AF0" stopOpacity="0" />
          <stop offset="35%" stopColor="#A88CFF" stopOpacity="0.9" />
          <stop offset="65%" stopColor="#7F5AF0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7F5AF0" stopOpacity="0" />
        </linearGradient>
        <filter id="wave-glow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      <path
        d="M0,60 C 80,20 140,100 220,60 C 300,20 360,100 440,60 C 520,20 580,80 600,60"
        fill="none"
        stroke="url(#wave-grad)"
        strokeWidth="2.5"
        filter="url(#wave-glow)"
      />
      <path
        d="M0,60 C 80,20 140,100 220,60 C 300,20 360,100 440,60 C 520,20 580,80 600,60"
        fill="none"
        stroke="url(#wave-grad)"
        strokeWidth="1.4"
      />
    </svg>
  );
}
