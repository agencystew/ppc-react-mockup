import { useMemo, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, ArrowRight, Sparkle, MagnifyingGlass,
  Info, Fire, Star, Lightbulb, SquaresFour, SlidersHorizontal,
  Target, CurrencyDollar, PaintBrush, ShieldCheck,
  ChartBar, Eye, Shield, Drop, TrendUp, PencilSimple, Browser,
  ShoppingCart, Lightning, ListChecks, MapTrifold, Gauge, Flask,
  WaveSawtooth, Buildings, UsersFour, Broadcast, Brain, ListBullets,
  Rocket,
} from '@phosphor-icons/react';
import { AGENTS } from '../mock/agents';
import type { AgentCategory, AgentDefinition } from '../types/agent';

/* /agents — Agent Catalog
 *
 * Rebuilt 2026-05-18 against Stewart's hero-illustration + sticky-sidebar
 * mockup. Two halves:
 *
 *   1. Hero — lavender canvas, eyebrow + "12 agents ready" pill, Figtree
 *      900 headline "Meet Your PPC Agents" with a Playfair-italic accent
 *      line "Specialists on standby." in purple. Search bar + suggestion
 *      chips on the left, the Agent Library illustration on the right.
 *      Drop `agent-library.png` into /public — a CSS-only fallback covers
 *      missing-asset cases so dev never blows up.
 *
 *   2. Catalog body — two-column grid:
 *        ┌──────────────────────────┐
 *        │ 264px categories  │  3-col grid of agent cards
 *        │ sticky sidebar    │   "Recommended for you" by default,
 *        │ + Suggest CTA     │   switches to per-category on filter click
 *        └──────────────────────────┘
 *
 * Per Stewart 2026-05-18: character faces ONLY in the hero illustration —
 * the grid cards keep the existing Phosphor duotone icons in tinted seats.
 *
 * Pre-run rules honoured (from memory):
 *   - No $ figures on cards          (feedback_no_pre_run_dollar_figures)
 *   - No minute estimates on cards   (feedback_no_pre_run_duration_claims)
 *   - No em-dashes in copy            (stewart-profile)
 *   - Bright purple #7F5AF0 rationed (CTA + status pills only)
 */

// ─── Italic-serif period — workspace signature mark ─────────────────────
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

// ─── Categories model ──────────────────────────────────────────────────
// Sidebar uses these eight buckets (plus "All" + "Recommended" meta rows).
// Each agent slug maps to exactly one bucket below. Counts compute live
// off SLUG_CATEGORY so the sidebar stays in sync if the agent list changes.

type CategoryKey =
  | 'all'
  | 'recommended'
  | 'audits'
  | 'insights'
  | 'optimization'
  | 'keywords'
  | 'budget-bids'
  | 'creative'
  | 'account-health';

interface CategoryDef {
  key: CategoryKey;
  label: string;
  icon: ReactElement;
}

const CATEGORIES: CategoryDef[] = [
  { key: 'all',            label: 'All agents',     icon: <SquaresFour       size={14} weight="duotone" /> },
  { key: 'recommended',    label: 'Recommended',    icon: <Star              size={14} weight="duotone" /> },
  { key: 'audits',         label: 'Audits',         icon: <MagnifyingGlass   size={14} weight="duotone" /> },
  { key: 'insights',       label: 'Insights',       icon: <Lightbulb         size={14} weight="duotone" /> },
  { key: 'optimization',   label: 'Optimization',   icon: <SlidersHorizontal size={14} weight="duotone" /> },
  { key: 'keywords',       label: 'Keywords',       icon: <Target            size={14} weight="duotone" /> },
  { key: 'budget-bids',    label: 'Budget & Bids',  icon: <CurrencyDollar    size={14} weight="duotone" /> },
  { key: 'creative',       label: 'Creative',       icon: <PaintBrush        size={14} weight="duotone" /> },
  { key: 'account-health', label: 'Account Health', icon: <ShieldCheck       size={14} weight="duotone" /> },
];

const SLUG_CATEGORY: Record<string, Exclude<CategoryKey, 'all' | 'recommended'>> = {
  'weekly-audit':         'audits',
  'deep-account-audit':   'audits',
  'change-impact':        'audits',
  'competitor-spy':       'insights',
  'buyer-journey':        'insights',
  'demand-ceiling':       'insights',
  'persona':              'insights',
  'readiness':            'insights',
  'business-context':     'insights',
  'competitor-context':   'insights',
  'google-ads-context':   'insights',
  'context-enrichment':   'insights',
  'profit-tracker':       'optimization',
  'campaign-architect':   'optimization',
  'test-recommender':     'optimization',
  'pmax':                 'optimization',
  'keyword':              'keywords',
  'keyword-auditor':      'keywords',
  'negative-keyword':     'keywords',
  'budget-pacer':         'budget-bids',
  'spend-leak':           'budget-bids',
  'ad-copy':              'creative',
  'landing-page':         'creative',
  'landing-page-designer':'creative',
  'shopping-feed':        'creative',
  'brand-safety':         'account-health',
  'client-reporting':     'account-health',
  'sales-intelligence':   'account-health',
  'new-client-autopilot': 'account-health',
};

// Recommended subset — first slug gets HIGH IMPACT pink/peach styling.
const RECOMMENDED_SLUGS = [
  'landing-page',        // HIGH IMPACT
  'weekly-audit',
  'competitor-spy',
  'keyword',
  'negative-keyword',
  'budget-pacer',
];

// Override card copy on recommended cards so the grid reads punchier
// than the generic catalog blurbs.
const RECOMMENDED_COPY: Record<string, {
  name: string;
  blurb: string;
  tag: string;
  cta: string;
}> = {
  'landing-page':     { name: 'Landing Page Match',     blurb: 'Analyze landing pages vs search intent and get specific CRO ideas.',         tag: 'Conversion',   cta: 'Run now' },
  'weekly-audit':     { name: 'Weekly Audit',           blurb: 'Full account health check across structure, spend, keywords and more.',     tag: 'Audit',        cta: 'Run audit' },
  'competitor-spy':   { name: 'Competitor Spy',         blurb: 'See what your competitors are doing and find the gaps you can exploit.',    tag: 'Insights',     cta: 'Run spy' },
  'keyword':          { name: 'Search Term Miner',      blurb: 'Uncover high-value search terms hiding in your data.',                       tag: 'Keywords',     cta: 'Run now' },
  'negative-keyword': { name: 'Negative Keyword Guard', blurb: "Find negative keywords you're missing and stop wasted spend.",              tag: 'Optimization', cta: 'Run now' },
  'budget-pacer':     { name: 'Budget Optimizer',       blurb: 'Reallocate budgets for maximum results across campaigns.',                   tag: 'Budget',       cta: 'Optimize' },
};

const TAG_PALETTE: Record<string, { bg: string; fg: string }> = {
  'Conversion':   { bg: '#FBE3EE', fg: '#B83361' },
  'Audit':        { bg: '#EEEDFE', fg: '#3C3489' },
  'Insights':     { bg: '#E6F1FB', fg: '#0C447C' },
  'Keywords':     { bg: '#EAF3DE', fg: '#27500A' },
  'Optimization': { bg: '#FAEEDA', fg: '#633806' },
  'Budget':       { bg: '#FAEEDA', fg: '#633806' },
};

// Soft tint behind each agent's icon glyph on grid cards.
const CATEGORY_TINT: Record<AgentCategory, { bg: string; fg: string }> = {
  operations:  { bg: '#EEEDFE', fg: '#534AB7' },
  diagnostics: { bg: '#EEEDFE', fg: '#534AB7' },
  strategic:   { bg: '#E6F1FB', fg: '#0C447C' },
  creative:    { bg: '#FBEAF0', fg: '#B83361' },
  buyer:       { bg: '#EAF3DE', fg: '#27500A' },
  client:      { bg: '#E1F5EE', fg: '#0F8C71' },
  context:     { bg: '#F1EFE8', fg: '#2C2C2A' },
};

// Per-slug Phosphor icon — kept as a single icon set across the grid so
// cards feel like one designed system, not platform emoji.
const SLUG_ICON: Record<string, ReactElement> = {
  'weekly-audit':         <ChartBar          size={22} weight="duotone" />,
  'deep-account-audit':   <MagnifyingGlass   size={22} weight="duotone" />,
  'negative-keyword':     <Shield            size={22} weight="duotone" />,
  'budget-pacer':         <CurrencyDollar    size={22} weight="duotone" />,
  'spend-leak':           <Drop              size={22} weight="duotone" />,
  'profit-tracker':       <TrendUp           size={22} weight="duotone" />,
  'ad-copy':              <PencilSimple      size={22} weight="duotone" />,
  'landing-page':         <Browser           size={22} weight="duotone" />,
  'landing-page-designer':<PaintBrush        size={22} weight="duotone" />,
  'shopping-feed':        <ShoppingCart      size={22} weight="duotone" />,
  'competitor-spy':       <Eye               size={22} weight="duotone" />,
  'pmax':                 <Lightning         size={22} weight="duotone" />,
  'keyword':              <Target            size={22} weight="duotone" />,
  'keyword-auditor':      <ListChecks        size={22} weight="duotone" />,
  'campaign-architect':   <SquaresFour       size={22} weight="duotone" />,
  'buyer-journey':        <MapTrifold        size={22} weight="duotone" />,
  'readiness':            <Gauge             size={22} weight="duotone" />,
  'demand-ceiling':       <ChartBar          size={22} weight="duotone" />,
  'test-recommender':     <Flask             size={22} weight="duotone" />,
  'change-impact':        <WaveSawtooth      size={22} weight="duotone" />,
  'brand-safety':         <ShieldCheck       size={22} weight="duotone" />,
  'business-context':     <Buildings         size={22} weight="duotone" />,
  'competitor-context':   <UsersFour         size={22} weight="duotone" />,
  'google-ads-context':   <Broadcast         size={22} weight="duotone" />,
  'persona':              <Brain             size={22} weight="duotone" />,
  'context-enrichment':   <Sparkle           size={22} weight="duotone" />,
  'client-reporting':     <ListBullets       size={22} weight="duotone" />,
  'sales-intelligence':   <Target            size={22} weight="duotone" />,
  'new-client-autopilot': <Rocket            size={22} weight="duotone" />,
};

// ════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════

export function AgentCatalog() {
  const [category, setCategory] = useState<CategoryKey>('recommended');

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all:         AGENTS.length,
      recommended: RECOMMENDED_SLUGS.length,
    };
    AGENTS.forEach((a) => {
      const k = SLUG_CATEGORY[a.slug];
      if (k) c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, []);

  const visible: AgentDefinition[] = useMemo(() => {
    if (category === 'all') return AGENTS;
    if (category === 'recommended') {
      return RECOMMENDED_SLUGS
        .map((slug) => AGENTS.find((a) => a.slug === slug))
        .filter((a): a is AgentDefinition => Boolean(a));
    }
    return AGENTS.filter((a) => SLUG_CATEGORY[a.slug] === category);
  }, [category]);

  return (
    <div className="space-y-12">
      <HeroBlock readyCount={12} />
      <CatalogBody
        category={category}
        counts={counts}
        agents={visible}
        onPickCategory={setCategory}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 1 · HERO
// ════════════════════════════════════════════════════════════════════════

function HeroBlock({ readyCount }: { readyCount: number }) {
  return (
    <section className="relative">
      {/* Ready pill — top-right. Eyebrow removed per Stewart 2026-05-18. */}
      <div className="flex justify-end">
        <ReadyPill count={readyCount} />
      </div>

      {/* Headline + illustration */}
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-12">
        <div className="flex flex-col">
          <h1 className="font-display font-black leading-[0.96] tracking-[-0.028em] text-ppc-ink text-[44px] sm:text-[54px] lg:text-[62px]">
            Meet Your PPC Agents
          </h1>
          <h1
            className="mt-1 leading-[1.04] tracking-[-0.016em] text-ppc-purple-500 text-[40px] sm:text-[50px] lg:text-[58px]"
            style={{
              fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 700,
            }}
          >
            Specialists on standby<span className="text-ppc-purple-500">.</span>
          </h1>

          <p className="mt-5 max-w-[540px] text-[15px] leading-[1.55] text-ppc-text-muted">
            Your AI bench of PPC experts. Run audits, uncover insights,
            and unlock growth, faster than your competitors can react.
          </p>

          <ScheduleCTA />
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}

/* Big purple-gradient CTA — borrows the Dashboard's "See all reports" pill
 * style (ppcio-cta class + linear-gradient + soft glow), scaled up for hero
 * prominence. Click → /chat?intent=schedule so the user sets up cadence
 * via a chat with our scheduling agent. */
function ScheduleCTA() {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
      <Link
        to="/chat?intent=schedule"
        className="ppcio-cta ppcio-cta--lg group relative inline-flex items-center gap-2.5 rounded-full text-white transition-transform hover:-translate-y-[1px]"
        style={{
          padding: '17px 30px',
          fontSize: '17px',
          fontWeight: 700,
          letterSpacing: '-0.012em',
          background:
            'linear-gradient(135deg, #9F86FF 0%, #7F5AF0 50%, #6A45E2 100%)',
          boxShadow:
            '0 8px 28px -6px rgba(70,49,134,0.65), 0 0 16px rgba(209,133,236,0.45) inset, 0 0 0 1px rgba(255,255,255,0.12)',
        }}
      >
        <Sparkle size={18} weight="fill" />
        Create your agent schedule
      </Link>
      <span className="text-[12.5px] font-medium text-ppc-text-muted">
        Chat with our AI to set the cadence
      </span>
    </div>
  );
}

function ReadyPill({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border-[0.5px] border-ppc-card-border bg-white pl-2.5 pr-3 py-[6px] text-[12.5px] font-semibold text-ppc-ink shadow-[0_2px_8px_-4px_rgba(15,10,30,0.08)]">
      <span className="relative inline-flex h-[7px] w-[7px]">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#5DC2A2]/55" />
        <span className="relative h-[7px] w-[7px] rounded-full bg-[#5DC2A2] shadow-[0_0_0_2px_rgba(93,194,162,0.18)]" />
      </span>
      <span>
        {count} agents ready
      </span>
      <Info size={12} weight="bold" className="text-ppc-text-faint" />
    </span>
  );
}

/* Agent Library hero image — six AI specialists on a two-tier shelf.
 * Drop the file at /public/agent-library.png. If absent, an onError
 * handler swaps in a CSS-only fallback so the layout never breaks. */
function HeroIllustration() {
  return (
    <div className="relative hidden lg:flex items-center justify-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 60% at 50% 55%, rgba(127,90,240,0.22) 0%, rgba(127,90,240,0.08) 45%, transparent 75%)',
        }}
      />
      <img
        src="/agent-library.png"
        alt="Agent Library — six AI specialists on a two-tier display shelf"
        className="relative w-full max-h-[420px] object-contain drop-shadow-[0_30px_40px_rgba(127,90,240,0.25)]"
        draggable={false}
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.style.display = 'none';
          const fb = img.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = 'grid';
        }}
      />
      <div
        aria-hidden
        className="relative hidden h-[360px] w-full place-items-center rounded-[24px] border-[0.5px] border-ppc-purple-300/40 bg-white/40 text-ppc-text-faint"
        style={{ display: 'none' }}
      >
        <span className="text-[12px] font-medium">Agent library</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 2 · BODY — categories sidebar + agent grid
// ════════════════════════════════════════════════════════════════════════

interface BodyProps {
  category: CategoryKey;
  counts: Record<string, number>;
  agents: AgentDefinition[];
  onPickCategory: (k: CategoryKey) => void;
}

function CatalogBody({ category, counts, agents, onPickCategory }: BodyProps) {
  return (
    <section className="grid items-start gap-5 lg:grid-cols-[264px_1fr]">
      <CategoriesSidebar
        category={category}
        counts={counts}
        onPick={onPickCategory}
      />
      <AgentsPanel category={category} agents={agents} />
    </section>
  );
}

// ─── Sticky categories sidebar ─────────────────────────────────────────

function CategoriesSidebar({
  category, counts, onPick,
}: {
  category: CategoryKey;
  counts: Record<string, number>;
  onPick: (k: CategoryKey) => void;
}) {
  return (
    <aside className="space-y-3 lg:sticky lg:top-6">
      <div className="rounded-[18px] border-[0.5px] border-ppc-card-border bg-white p-4 shadow-[0_2px_12px_-8px_rgba(15,10,30,0.05)]">
        <h3 className="px-2 pb-3 text-[14.5px] font-bold tracking-[-0.012em] text-ppc-ink">
          Categories
        </h3>
        <ul className="flex flex-col gap-[2px]">
          {CATEGORIES.map((c) => (
            <li key={c.key}>
              <CategoryRow
                def={c}
                active={category === c.key}
                count={counts[c.key] ?? 0}
                onClick={() => onPick(c.key)}
              />
            </li>
          ))}
        </ul>
      </div>

      <SuggestCard />
    </aside>
  );
}

function CategoryRow({
  def, active, count, onClick,
}: {
  def: CategoryDef;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-[8px] text-left transition-colors ${
        active
          ? 'bg-ppc-panel-soft text-ppc-ink'
          : 'text-ppc-text-muted hover:bg-[#F6F4FE] hover:text-ppc-ink'
      }`}
    >
      <span
        className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[6px] transition-colors ${
          active
            ? 'bg-white text-ppc-purple-500 shadow-[inset_0_0_0_1px_rgba(127,90,240,0.20)]'
            : 'text-ppc-text-faint group-hover:text-ppc-purple-500'
        }`}
      >
        {def.icon}
      </span>
      <span className="flex-1 text-[13px] font-semibold tracking-[-0.005em]">
        {def.label}
      </span>
      <span
        className={`tabular-nums text-[11px] font-semibold ${
          active ? 'text-ppc-purple-600' : 'text-ppc-text-faint'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function SuggestCard() {
  return (
    <button
      type="button"
      className="group flex w-full items-center gap-3 rounded-[16px] border-[0.5px] border-ppc-purple-300/30 bg-ppc-panel-soft px-4 py-3.5 text-left transition-all hover:-translate-y-[0.5px] hover:border-ppc-purple-300/60 hover:shadow-[0_8px_22px_-14px_rgba(127,90,240,0.35)]"
    >
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold leading-tight text-ppc-ink">
          Suggest an agent
        </div>
        <div className="mt-0.5 text-[11.5px] leading-tight text-ppc-text-muted">
          Tell us what you need
        </div>
      </div>
      <span
        aria-hidden
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-ppc-purple-500 shadow-[0_4px_12px_-6px_rgba(127,90,240,0.45)] transition-transform group-hover:-translate-y-[1px]"
      >
        <Lightbulb size={16} weight="duotone" />
      </span>
    </button>
  );
}

// ─── Agents panel (right column) ───────────────────────────────────────

function AgentsPanel({
  category, agents,
}: { category: CategoryKey; agents: AgentDefinition[] }) {
  const isRecommended = category === 'recommended';
  const header = isRecommended
    ? 'Recommended for you'
    : CATEGORIES.find((c) => c.key === category)?.label ?? 'Agents';

  return (
    <div className="rounded-[20px] border-[0.5px] border-ppc-card-border bg-white p-5 shadow-[0_2px_12px_-8px_rgba(15,10,30,0.05)] lg:p-6">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-display text-[20px] font-bold tracking-[-0.012em] text-ppc-ink">
          <span>{header}</span>
          {isRecommended && (
            <Sparkle size={16} weight="fill" className="-mt-0.5 text-ppc-purple-500" />
          )}
          <P />
        </h2>
        {isRecommended && (
          <Link
            to="/chat?intent=why-these"
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500 hover:text-ppc-purple-600"
          >
            View all recommended
            <ArrowRight size={11} weight="bold" />
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((a, i) => (
          <AgentGridCard
            key={a.slug}
            agent={a}
            highImpact={isRecommended && i === 0}
            useRecommendedCopy={isRecommended}
          />
        ))}
      </div>

      {agents.length === 0 && (
        <div className="rounded-[12px] border-[0.5px] border-dashed border-ppc-card-border bg-ppc-canvas/30 p-10 text-center">
          <p className="text-[13.5px] text-ppc-text-muted">
            No agents in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Single agent card ─────────────────────────────────────────────────

function AgentGridCard({
  agent: a, highImpact, useRecommendedCopy,
}: {
  agent: AgentDefinition;
  highImpact: boolean;
  useRecommendedCopy: boolean;
}) {
  const tint = CATEGORY_TINT[a.category];
  const icon = SLUG_ICON[a.slug];
  const copy = useRecommendedCopy ? RECOMMENDED_COPY[a.slug] : undefined;
  const tagLabel = copy?.tag
    ?? CATEGORIES.find((c) => c.key === SLUG_CATEGORY[a.slug])?.label;
  const tagPalette = tagLabel ? TAG_PALETTE[tagLabel] : null;
  const ctaLabel = copy?.cta ?? 'Run now';
  const cardName = copy?.name ?? a.name;
  const cardBlurb = copy?.blurb ?? a.outcomeDescription;

  return (
    <Link
      to={`/agents/${a.slug}`}
      data-card={highImpact ? 'high-impact' : 'standard'}
      className={`group relative flex flex-col rounded-[16px] p-5 transition-all hover:-translate-y-[1px] ${
        highImpact
          ? ''
          : 'border-[0.5px] border-ppc-card-border bg-white hover:border-ppc-purple-300 hover:shadow-[0_12px_30px_-18px_rgba(127,90,240,0.40)]'
      }`}
      style={
        highImpact
          ? {
              background:
                'linear-gradient(165deg, #FFEFF6 0%, #FBE3EE 55%, #FCDCE7 100%)',
              boxShadow:
                'inset 0 0 0 1px rgba(232,113,170,0.30), 0 14px 36px -20px rgba(232,113,170,0.55)',
            }
          : undefined
      }
    >
      {highImpact && (
        <span
          className="absolute -top-2 left-5 inline-flex items-center gap-1 rounded-full px-2.5 py-[4px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-white"
          style={{
            background: 'linear-gradient(95deg, #F25C9E 0%, #E0418A 100%)',
            boxShadow: '0 6px 16px -8px rgba(232,113,170,0.65)',
          }}
        >
          <Fire size={10} weight="fill" />
          High impact
        </span>
      )}

      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className="grid h-12 w-12 place-items-center rounded-full"
          style={{
            background: highImpact ? '#F9D3E3' : tint.bg,
            color:      highImpact ? '#B83361' : tint.fg,
          }}
        >
          {icon ?? <span className="text-[22px]">{a.emoji}</span>}
        </span>
        <button
          type="button"
          aria-label="Favourite"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="grid h-7 w-7 place-items-center rounded-full text-ppc-text-faint transition-colors hover:bg-ppc-canvas/60 hover:text-ppc-purple-500"
        >
          <Star size={14} weight="bold" />
        </button>
      </div>

      <h3 className="mt-3.5 font-display text-[16.5px] font-bold leading-[1.2] tracking-[-0.012em] text-ppc-ink">
        {cardName}<P />
      </h3>

      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.55] tracking-tight text-ppc-text-muted">
        {cardBlurb}
      </p>

      <div className="mt-3.5 flex items-center gap-1.5">
        {tagLabel && tagPalette && (
          <span
            className="inline-flex items-center rounded-[5px] px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em]"
            style={{ background: tagPalette.bg, color: tagPalette.fg }}
          >
            {tagLabel}
          </span>
        )}
      </div>

      <div className="mt-auto pt-4">
        {highImpact ? (
          <span
            className="flex items-center justify-center gap-1.5 rounded-[12px] px-4 py-[10px] text-[13px] font-semibold text-white transition-all group-hover:-translate-y-[1px]"
            style={{
              background:
                'linear-gradient(95deg, #F25C9E 0%, #E0418A 60%, #C9337A 100%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.22), 0 8px 22px -10px rgba(232,113,170,0.65)',
            }}
          >
            {ctaLabel}
            <ArrowUpRight size={12} weight="bold" />
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5 rounded-[12px] border-[0.5px] border-ppc-card-border bg-white px-4 py-[10px] text-[13px] font-semibold text-ppc-ink transition-all group-hover:border-ppc-purple-300 group-hover:text-ppc-purple-700">
            {ctaLabel}
            <ArrowUpRight size={12} weight="bold" />
          </span>
        )}
      </div>
    </Link>
  );
}
