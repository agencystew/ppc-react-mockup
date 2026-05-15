import type { ReactElement } from 'react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Bell, Brain, Broadcast, Browser, Buildings,
  CalendarBlank, CaretLeft, CaretRight, ChartBar, Clock, Compass, Drop, Eye,
  Fire, Flask, Funnel, Gauge, GridFour, Lightning, ListBullets, ListChecks,
  MagnifyingGlass, MapTrifold, PaintBrush, PaperPlaneTilt, PencilSimple,
  Rocket, Shield, ShieldCheck, ShoppingCart, Sparkle, SlidersHorizontal,
  SquaresFour, Target, TrendUp, UsersFour, WaveSawtooth,
} from '@phosphor-icons/react';
import { AGENTS } from '../mock/agents';
import type { AgentCategory, AgentDefinition } from '../types/agent';

// Agent Catalog · /agents
// Redesigned 2026-05-15 against the "bench of specialists" concept Stewart
// approved. Lavender canvas, soft cards, 5-up recommended carousel with a
// single HIGH-IMPACT pink card in the middle, then a dark "Build your
// weekly agent plan" banner, then the full grid.
//
// Pre-run rules HONOURED here (override anything the source mockup did):
//   - No $ figures pre-run    (feedback_no_pre_run_dollar_figures)
//   - No duration chips pre-run (feedback_no_pre_run_duration_claims)
//   - No em-dashes anywhere   (stewart-profile)
//   - Trailing purple period on every headline (DESIGN-SYSTEM)
//   - Bright purple #7F5AF0 is rationed (status pills + primary CTA only)

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

// ─── Surface-level outcome buckets ──────────────────────────────────────
// User-facing pill labels group the underlying AgentCategory tags into
// outcome-led buckets that read better above the fold. Each agent slug
// maps to exactly one bucket so the counts add up cleanly.

type Bucket = 'all' | 'audit' | 'optimize' | 'protect' | 'insights';

const BUCKET_LABEL: Record<Exclude<Bucket, 'all'>, string> = {
  audit:    'Audit & Diagnose',
  optimize: 'Optimize & Grow',
  protect:  'Protect & Save',
  insights: 'Insights & Research',
};

const SLUG_BUCKET: Record<string, Exclude<Bucket, 'all'>> = {
  // Audit & Diagnose
  'weekly-audit':         'audit',
  'deep-account-audit':   'audit',
  'change-impact':        'audit',
  'demand-ceiling':       'audit',
  'test-recommender':     'audit',
  'pmax':                 'audit',
  'landing-page':         'audit',
  // Optimize & Grow
  'keyword':              'optimize',
  'campaign-architect':   'optimize',
  'budget-pacer':         'optimize',
  'profit-tracker':       'optimize',
  'ad-copy':              'optimize',
  'landing-page-designer':'optimize',
  'shopping-feed':        'optimize',
  // Protect & Save
  'negative-keyword':     'protect',
  'spend-leak':           'protect',
  'keyword-auditor':      'protect',
  'brand-safety':         'protect',
  // Insights & Research
  'competitor-spy':       'insights',
  'buyer-journey':        'insights',
  'readiness':            'insights',
  'persona':              'insights',
  'business-context':     'insights',
  'competitor-context':   'insights',
  'google-ads-context':   'insights',
  'context-enrichment':   'insights',
  'sales-intelligence':   'insights',
  'client-reporting':     'insights',
  'new-client-autopilot': 'insights',
};

// Chip palette per bucket — soft tint background + deep readable text.
const BUCKET_PALETTE: Record<Exclude<Bucket, 'all'>, { bg: string; fg: string }> = {
  audit:    { bg: '#EEEDFE', fg: '#3C3489' },
  optimize: { bg: '#EAF3DE', fg: '#27500A' },
  protect:  { bg: '#FAEEDA', fg: '#633806' },
  insights: { bg: '#E6F1FB', fg: '#0C447C' },
};

// Mascot-seat icon tint per agent slug (the soft circle behind the icon).
// Keeps each card visually distinct on the grid without depending on
// emoji rendering across platforms.
const CATEGORY_TINT: Record<AgentCategory, { bg: string; fg: string }> = {
  operations:  { bg: '#EEEDFE', fg: '#534AB7' },
  diagnostics: { bg: '#EEEDFE', fg: '#534AB7' },
  strategic:   { bg: '#E6F1FB', fg: '#0C447C' },
  creative:    { bg: '#FBEAF0', fg: '#B83361' },
  buyer:       { bg: '#EAF3DE', fg: '#27500A' },
  client:      { bg: '#E1F5EE', fg: '#0F8C71' },
  context:     { bg: '#F1EFE8', fg: '#2C2C2A' },
};

// ─── Per-slug Phosphor icon ─────────────────────────────────────────────
// The concept renders agent cards with clean line icons inside tinted
// circular badges, not platform emoji. We keep emoji in the agent data
// (used elsewhere as a fast eyeball-glyph) but override the visual on
// /agents so the grid reads like a single icon set.
const SLUG_ICON: Record<string, ReactElement> = {
  'weekly-audit':         <ChartBar          size={20} weight="duotone" />,
  'deep-account-audit':   <MagnifyingGlass   size={20} weight="duotone" />,
  'negative-keyword':     <Shield            size={20} weight="duotone" />,
  'budget-pacer':         <Clock             size={20} weight="duotone" />,
  'spend-leak':           <Drop              size={20} weight="duotone" />,
  'profit-tracker':       <TrendUp           size={20} weight="duotone" />,
  'ad-copy':              <PencilSimple      size={20} weight="duotone" />,
  'landing-page':         <Browser           size={20} weight="duotone" />,
  'landing-page-designer':<PaintBrush        size={20} weight="duotone" />,
  'shopping-feed':        <ShoppingCart      size={20} weight="duotone" />,
  'competitor-spy':       <Eye               size={20} weight="duotone" />,
  'pmax':                 <Lightning         size={20} weight="duotone" />,
  'keyword':              <Target            size={20} weight="duotone" />,
  'keyword-auditor':      <ListChecks        size={20} weight="duotone" />,
  'campaign-architect':   <SquaresFour       size={20} weight="duotone" />,
  'buyer-journey':        <MapTrifold        size={20} weight="duotone" />,
  'readiness':            <Gauge             size={20} weight="duotone" />,
  'demand-ceiling':       <ChartBar          size={20} weight="duotone" />,
  'test-recommender':     <Flask             size={20} weight="duotone" />,
  'change-impact':        <WaveSawtooth      size={20} weight="duotone" />,
  'brand-safety':         <ShieldCheck       size={20} weight="duotone" />,
  'business-context':     <Buildings         size={20} weight="duotone" />,
  'competitor-context':   <UsersFour         size={20} weight="duotone" />,
  'google-ads-context':   <Broadcast         size={20} weight="duotone" />,
  'persona':              <Brain             size={20} weight="duotone" />,
  'context-enrichment':   <Sparkle           size={20} weight="duotone" />,
  'client-reporting':     <ListBullets       size={20} weight="duotone" />,
  'sales-intelligence':   <Target            size={20} weight="duotone" />,
  'new-client-autopilot': <Rocket            size={20} weight="duotone" />,
};

// ─── Suggestion chips below the search bar ──────────────────────────────
const SUGGESTIONS = [
  'Find wasted spend',
  'Beat my competitor',
  'Improve ROAS',
  'Audit my account',
];

// ─── Recommended carousel (5 cards, center is HIGH IMPACT) ──────────────
// Order matters. Index 2 (third card) is the highlighted impact pick.
const RECOMMENDED_SLUGS = [
  'weekly-audit',
  'competitor-spy',
  'landing-page',
  'negative-keyword',
  'keyword',
];

const RECOMMENDED_TAG: Record<string, { label: string; palette: Exclude<Bucket, 'all'> }> = {
  'weekly-audit':    { label: 'Routine',    palette: 'audit' },
  'competitor-spy':  { label: 'Insights',   palette: 'insights' },
  'landing-page':    { label: 'Conversion', palette: 'audit' },
  'negative-keyword':{ label: 'Waste',      palette: 'protect' },
  'keyword':         { label: 'Growth',     palette: 'optimize' },
};

// Override recommended card copy so the carousel reads punchier than the
// generic catalog descriptions. Pre-run rules still apply (no $, no MIN).
const RECOMMENDED_COPY: Record<string, { name: string; blurb: string; icon: ReactElement }> = {
  'weekly-audit': {
    name: 'Weekly Audit',
    blurb: 'Full account health check across structure, spend, keywords, and performance.',
    icon: <ChartBar size={24} weight="duotone" />,
  },
  'competitor-spy': {
    name: 'Competitor Spy',
    blurb: "See what your competitors are doing, and find the gaps you can exploit.",
    icon: <Eye size={24} weight="duotone" />,
  },
  'landing-page': {
    name: 'Landing Page Match',
    blurb: 'Analyze your landing pages versus search intent and get specific improvement ideas.',
    icon: <Target size={24} weight="duotone" />,
  },
  'negative-keyword': {
    name: 'Negative Keyword',
    blurb: 'Discover and group brand-safe negative keywords that stop waste cold.',
    icon: <Shield size={24} weight="duotone" />,
  },
  'keyword': {
    name: 'Expansion Opportunities',
    blurb: 'Find high-opportunity keywords and audiences ready to scale your growth.',
    icon: <TrendUp size={24} weight="duotone" />,
  },
};

// ════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════

export function AgentCatalog() {
  const [bucket, setBucket] = useState<Bucket>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: AGENTS.length };
    AGENTS.forEach((a) => {
      const b = SLUG_BUCKET[a.slug];
      if (b) c[b] = (c[b] || 0) + 1;
    });
    return c;
  }, []);

  const visible = useMemo(() => {
    if (bucket === 'all') return AGENTS;
    return AGENTS.filter((a) => SLUG_BUCKET[a.slug] === bucket);
  }, [bucket]);

  const recommended = useMemo(
    () => RECOMMENDED_SLUGS
      .map((slug) => AGENTS.find((a) => a.slug === slug))
      .filter((a): a is AgentDefinition => Boolean(a)),
    [],
  );

  return (
    <div className="space-y-14">
      <HeroBlock />
      <RecommendedCarousel agents={recommended} />
      <PlanBanner />
      <AllSpecialists
        bucket={bucket}
        counts={counts}
        view={view}
        agents={visible}
        onPickBucket={setBucket}
        onToggleView={() => setView(view === 'grid' ? 'list' : 'grid')}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 1 · HERO
// ════════════════════════════════════════════════════════════════════════

function HeroBlock() {
  return (
    <section className="grid items-start gap-8 lg:grid-cols-[1fr_460px]">
      <div className="flex flex-col">
        <span className="inline-flex w-fit items-center rounded-full bg-ppc-panel-soft px-3 py-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ppc-purple-700">
          Agents
        </span>

        <h1 className="mt-5 font-display font-black leading-[0.94] tracking-[-0.038em] text-ppc-ink text-[56px] sm:text-[72px] lg:text-[84px]">
          Your PPC Agents<P />
          <br />
          <span
            className="font-serif italic font-bold text-ppc-purple-500"
            style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
          >
            Always Working
          </span>
          <P />
        </h1>

        <p className="mt-5 max-w-[560px] text-[14.5px] leading-[1.55] text-ppc-text-muted">
          Your AI bench of PPC experts. Run audits, uncover insights, and
          unlock growth, faster than your competitors can react.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
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

      <MascotBench />
    </section>
  );
}

function SearchBar() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-1 items-center gap-2 rounded-[16px] border-[0.5px] border-ppc-card-border bg-white py-2.5 pl-4 pr-2.5 shadow-[0_2px_10px_-6px_rgba(15,10,30,0.08)] focus-within:border-ppc-purple-300 focus-within:shadow-[0_0_0_4px_rgba(127,90,240,0.10),0_4px_14px_-6px_rgba(127,90,240,0.25)]"
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
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-ppc-purple-500 text-white shadow-[0_4px_14px_-4px_rgba(127,90,240,0.55)] transition-all hover:-translate-y-[1px] hover:bg-ppc-purple-600"
      >
        <PaperPlaneTilt size={15} weight="fill" />
      </button>
    </form>
  );
}

// Mascot bench image — the hero's emotional anchor. Sits in the top
// right of the hero on lg+, hides on mobile to keep the H1 the moment.
// Source asset is a transparent RGBA PNG (3088×1200) so no blend hack.
function MascotBench() {
  return (
    <div className="relative hidden h-[320px] w-full lg:block">
      {/* Soft lavender bloom behind the image — stage-light glow under
        * the center "AI Specialist" mascot, not a flat backdrop. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 60% at 50% 55%, rgba(127,90,240,0.22) 0%, rgba(127,90,240,0.08) 45%, transparent 75%)',
        }}
      />
      <img
        src="/agents-mascots.png"
        alt="Four AI specialists on stadium seats, the center mascot framed as today's pick"
        className="relative h-full w-full object-contain"
        draggable={false}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 2 · RECOMMENDED CAROUSEL
// ════════════════════════════════════════════════════════════════════════

function RecommendedCarousel({ agents }: { agents: AgentDefinition[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  // High-impact card index inside the recommended list.
  const HIGHLIGHT_INDEX = 2;

  function scrollBy(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-rec-card]');
    const step = card ? card.offsetWidth + 12 : 280;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  return (
    <section className="relative">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ppc-purple-700">
          <Sparkle size={11} weight="fill" />
          Recommended for you
        </span>
        <Link
          to="/chat?intent=why-these"
          className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ppc-purple-500 hover:text-ppc-purple-600"
        >
          Why these?
          <ArrowRight size={11} weight="bold" />
        </Link>
      </div>

      <div className="relative">
        {/* Carousel arrows — sit outside the row on desktop. */}
        <CarouselArrow side="left"  onClick={() => scrollBy(-1)} />
        <CarouselArrow side="right" onClick={() => scrollBy(1)}  />

        <div
          ref={scrollerRef}
          className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {agents.map((a, i) => (
            <RecommendedCard
              key={a.slug}
              agent={a}
              highlight={i === HIGHLIGHT_INDEX}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CarouselArrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      aria-label={side === 'left' ? 'Previous' : 'Next'}
      onClick={onClick}
      className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border-[0.5px] border-ppc-card-border bg-white text-ppc-ink shadow-[0_8px_22px_-12px_rgba(15,10,30,0.20)] transition-all hover:-translate-y-[calc(50%+1px)] hover:border-ppc-purple-300 hover:text-ppc-purple-500 lg:grid ${
        side === 'left' ? '-left-5' : '-right-5'
      }`}
    >
      {side === 'left' ? <CaretLeft size={14} weight="bold" /> : <CaretRight size={14} weight="bold" />}
    </button>
  );
}

function RecommendedCard({
  agent: a,
  highlight,
}: { agent: AgentDefinition; highlight: boolean }) {
  const copy = RECOMMENDED_COPY[a.slug];
  const tag = RECOMMENDED_TAG[a.slug];
  const tagPalette = tag ? BUCKET_PALETTE[tag.palette] : null;
  const tint = CATEGORY_TINT[a.category];

  return (
    <Link
      data-rec-card
      to={`/agents/${a.slug}`}
      className={`group relative flex w-[280px] shrink-0 snap-start flex-col rounded-[16px] p-5 transition-all hover:-translate-y-[1px] sm:w-[300px] ${
        highlight
          ? ''
          : 'border-[0.5px] border-ppc-card-border bg-white hover:border-ppc-purple-300 hover:shadow-[0_10px_28px_-18px_rgba(127,90,240,0.40)]'
      }`}
      style={
        highlight
          ? {
              background:
                'linear-gradient(165deg, #FFEFF6 0%, #FBE3EE 55%, #FCDCE7 100%)',
              boxShadow:
                'inset 0 0 0 1px rgba(232,113,170,0.30), 0 12px 32px -18px rgba(232,113,170,0.55)',
            }
          : undefined
      }
    >
      {highlight && (
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
            background: highlight ? '#F9D3E3' : tint.bg,
            color:      highlight ? '#B83361' : tint.fg,
          }}
        >
          {copy?.icon ?? <span className="text-[22px]">{a.emoji}</span>}
        </span>
        <ArrowUpRight
          size={13}
          weight="bold"
          className="mt-1 text-ppc-text-faint transition-colors group-hover:text-ppc-purple-500"
        />
      </div>

      <h3 className="mt-3 font-display text-[17px] font-bold leading-[1.2] tracking-[-0.012em] text-ppc-ink">
        {copy?.name ?? a.name}<P />
      </h3>

      <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-[1.55] tracking-tight text-ppc-text-muted">
        {copy?.blurb ?? a.outcomeDescription}
      </p>

      <div className="mt-3 flex items-center gap-1.5">
        {tag && tagPalette && (
          <span
            className="inline-flex items-center rounded-[5px] px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em]"
            style={{ background: tagPalette.bg, color: tagPalette.fg }}
          >
            {tag.label}
          </span>
        )}
      </div>

      <div className="mt-4">
        {highlight ? (
          <span
            className="flex items-center justify-center gap-1.5 rounded-[12px] px-4 py-[10px] text-[13px] font-semibold tracking-tight text-white transition-all group-hover:-translate-y-[1px]"
            style={{
              background:
                'linear-gradient(95deg, #F25C9E 0%, #E0418A 60%, #C9337A 100%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.22), 0 8px 22px -10px rgba(232,113,170,0.65)',
            }}
          >
            Run now
            <ArrowUpRight size={12} weight="bold" />
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5 rounded-[12px] border-[0.5px] border-ppc-card-border bg-white px-4 py-[10px] text-[13px] font-semibold text-ppc-ink transition-all group-hover:border-ppc-purple-300 group-hover:text-ppc-purple-700">
            Run now
            <ArrowUpRight size={12} weight="bold" />
          </span>
        )}
      </div>
    </Link>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 3 · BUILD YOUR WEEKLY AGENT PLAN — dark banner
// ════════════════════════════════════════════════════════════════════════

function PlanBanner() {
  return (
    <section
      className="relative overflow-hidden rounded-[20px] px-7 py-7 text-white sm:px-9 sm:py-8"
      style={{
        background:
          'linear-gradient(160deg, #150D2C 0%, #0F0A1E 55%, #08051A 100%)',
        boxShadow:
          'inset 0 0 0 1px rgba(127,90,240,0.22), 0 14px 40px -22px rgba(127,90,240,0.40)',
      }}
    >
      {/* Top-right purple bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-[300px] w-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(127,90,240,0.32) 0%, transparent 60%)' }}
      />

      <div className="relative grid items-center gap-x-10 gap-y-8 lg:grid-cols-[minmax(280px,_360px)_minmax(0,_1fr)_auto]">
        {/* Headline column — pinned to a 280-360px range so the H2 can
          * break cleanly on two lines instead of getting crushed into a
          * single-word stack when the steps row grows. */}
        <div>
          <h2 className="font-display text-[28px] font-black leading-[1.05] tracking-[-0.020em] sm:text-[32px]">
            Build your{' '}
            <span
              className="font-serif italic font-bold text-[#C7B0FF]"
              style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
            >
              weekly
            </span>
            <br />
            agent plan<span
              className="font-serif italic text-[#C7B0FF]"
              style={{ fontFamily: 'PF-Marlet-Display, "Playfair Display", Georgia, serif' }}
            >.</span>
          </h2>
          <p className="mt-3 max-w-[340px] text-[13.5px] leading-[1.55] text-white/65">
            Schedule the right agents to run automatically. Wake up to insights, not dashboards.
          </p>
        </div>

        {/* Steps column — flex row that wraps gracefully but never
          * steals room from the headline column. */}
        <div className="grid gap-x-7 gap-y-4 sm:grid-cols-3">
          <PlanStep n={1} icon={<CalendarBlank size={18} weight="duotone" />} title="Choose frequency"        desc="Daily, weekly, or custom." />
          <PlanStep n={2} icon={<SlidersHorizontal size={18} weight="duotone" />} title="Pick your specialists" desc="Build the perfect agent lineup." />
          <PlanStep n={3} icon={<Bell size={18} weight="duotone" />} title="Get insights on autopilot"           desc="Delivered to your inbox and dashboard." />
        </div>

        <Link
          to="/chat?intent=schedule"
          className="group inline-flex items-center justify-center gap-2 self-center rounded-[14px] px-6 py-[14px] text-[14px] font-semibold text-white transition-transform hover:-translate-y-[1px]"
          style={{
            background: 'linear-gradient(155deg, #A88CFF 0%, #7F5AF0 55%, #534AB7 100%)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.22), 0 10px 26px -10px rgba(127,90,240,0.75)',
          }}
        >
          <Sparkle size={14} weight="fill" />
          Create my plan
          <ArrowRight size={13} weight="bold" className="transition-transform group-hover:translate-x-[1px]" />
        </Link>
      </div>
    </section>
  );
}

function PlanStep({
  n, icon, title, desc,
}: { n: number; icon: ReactElement; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="font-mono text-[11px] font-semibold tracking-[0.10em] text-white/45">{n}</span>
      <span
        aria-hidden
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#C7B0FF]"
        style={{
          background: 'rgba(127,90,240,0.10)',
          boxShadow:  'inset 0 0 0 1px rgba(199,176,255,0.22)',
        }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold leading-[1.2] text-white">{title}</div>
        <div className="mt-0.5 text-[11.5px] leading-[1.35] text-white/55">{desc}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 4 · ALL SPECIALISTS
// ════════════════════════════════════════════════════════════════════════

interface AllProps {
  bucket: Bucket;
  counts: Record<string, number>;
  view: 'grid' | 'list';
  agents: AgentDefinition[];
  onPickBucket: (b: Bucket) => void;
  onToggleView: () => void;
}

function AllSpecialists({
  bucket, counts, view, agents, onPickBucket, onToggleView,
}: AllProps) {
  const PRIMARY: Array<{ key: Bucket; label: string }> = [
    { key: 'all',      label: 'All' },
    { key: 'audit',    label: BUCKET_LABEL.audit },
    { key: 'optimize', label: BUCKET_LABEL.optimize },
    { key: 'protect',  label: BUCKET_LABEL.protect },
    { key: 'insights', label: BUCKET_LABEL.insights },
  ];

  return (
    <section>
      <span className="inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ppc-purple-700">
        <Compass size={11} weight="fill" />
        All specialists
      </span>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {PRIMARY.map((f) => (
          <FilterPill
            key={f.key}
            label={f.label}
            count={counts[f.key] ?? 0}
            active={bucket === f.key}
            onSelect={() => onPickBucket(f.key)}
          />
        ))}

        <span className="mx-1 h-5 w-px bg-ppc-card-border" />

        <button className="inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-ppc-card-border bg-white px-3 py-[7px] text-[12px] font-medium text-ppc-ink transition-colors hover:border-ppc-purple-300">
          <Funnel size={12} weight="bold" />
          Filters
        </button>

        <div className="ml-auto inline-flex overflow-hidden rounded-full border-[0.5px] border-ppc-card-border bg-white">
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
            ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'flex flex-col gap-2'
        }`}
      >
        {agents.map((a) =>
          view === 'grid'
            ? <AgentCard key={a.slug} agent={a} />
            : <AgentRow  key={a.slug} agent={a} />,
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

// ─── Grid card ──────────────────────────────────────────────────────────

function AgentCard({ agent: a }: { agent: AgentDefinition }) {
  const tint = CATEGORY_TINT[a.category];
  const b = SLUG_BUCKET[a.slug];
  const bucketPalette = b ? BUCKET_PALETTE[b] : null;
  const icon = SLUG_ICON[a.slug];
  return (
    <Link
      to={`/agents/${a.slug}`}
      className="group flex h-full flex-col rounded-[14px] border-[0.5px] border-ppc-card-border bg-white p-5 transition-all hover:-translate-y-[1px] hover:border-ppc-purple-300 hover:shadow-[0_10px_28px_-18px_rgba(127,90,240,0.40)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className="grid h-11 w-11 place-items-center rounded-full"
          style={{ background: tint.bg, color: tint.fg }}
        >
          {icon ?? <span className="text-[20px] leading-none">{a.emoji}</span>}
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

      <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-[1.55] tracking-tight text-ppc-text-muted">
        {a.outcomeDescription}
      </p>

      <div className="mt-auto flex items-center gap-1.5 pt-4">
        {bucketPalette && (
          <span
            className="inline-flex items-center rounded-[5px] px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em]"
            style={{ background: bucketPalette.bg, color: bucketPalette.fg }}
          >
            {b && BUCKET_LABEL[b]}
          </span>
        )}
      </div>
    </Link>
  );
}

function AgentRow({ agent: a }: { agent: AgentDefinition }) {
  const tint = CATEGORY_TINT[a.category];
  const b = SLUG_BUCKET[a.slug];
  const bucketPalette = b ? BUCKET_PALETTE[b] : null;
  const icon = SLUG_ICON[a.slug];
  return (
    <Link
      to={`/agents/${a.slug}`}
      className="group flex items-center gap-4 rounded-[12px] border-[0.5px] border-ppc-card-border bg-white px-4 py-3 transition-all hover:-translate-y-[0.5px] hover:border-ppc-purple-300"
    >
      <span
        aria-hidden
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
        style={{ background: tint.bg, color: tint.fg }}
      >
        {icon ?? <span className="text-[19px] leading-none">{a.emoji}</span>}
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-[14px] font-semibold leading-tight tracking-[-0.01em] text-ppc-ink">
          {a.name}
        </h4>
        <p className="truncate text-[12px] leading-[1.4] tracking-tight text-ppc-text-muted">
          {a.outcomeDescription}
        </p>
      </div>
      {bucketPalette && (
        <span
          className="hidden shrink-0 rounded-[5px] px-2 py-[3px] font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em] sm:inline-flex"
          style={{ background: bucketPalette.bg, color: bucketPalette.fg }}
        >
          {b && BUCKET_LABEL[b]}
        </span>
      )}
      <ArrowUpRight
        size={13}
        weight="bold"
        className="shrink-0 text-ppc-text-faint transition-colors group-hover:text-ppc-purple-500"
      />
    </Link>
  );
}
